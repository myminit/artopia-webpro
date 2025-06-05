// File: app/draw/page.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  TOOL_TYPE,
  DEFAULT_BRUSH_SIZE,
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
} from './constants';

import CustomCanvas, { CustomCanvasRef } from './CustomCanvas';
import Toolbar from './Toolbar';
import Topbar from './Topbar';
import { useCustomAutoSave } from './useCustomAutoSave';

export default function DrawPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadId = searchParams.get('loadId');

  const canvasRef = useRef<CustomCanvasRef | null>(null);

  const [tool, setTool] = useState(TOOL_TYPE.BRUSH);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY_COLOR);
  const [activeColor, setActiveColor] = useState<'primary' | 'secondary'>('primary');
  const [drawingName, setDrawingName] = useState<string>('untitled');
  const [saving, setSaving] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // เรียก hook autosave
  useCustomAutoSave(canvasRef);

  // ─── A: โหลดภาพเก่า (ถ้ามี loadId) ───────────────────────────────────────
  useEffect(() => {
    if (!loadId) return;

    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        if (r.ok) {
          setIsLoggedIn(true);
          return fetch(`/api/canvas/load?loadId=${loadId}`, { credentials: 'include' });
        } else {
          setIsLoggedIn(false);
          return null;
        }
      })
      .then(async (res) => {
        if (!res || !res.ok) return;
        const data = (await res.json()) as { imageUrl: string; name: string };
        if (data.imageUrl) {
          // โหลดรูปจาก URL ลงใน CustomCanvas
          canvasRef.current?.loadImage(data.imageUrl);
          setDrawingName(data.name || 'untitled');
          // เมื่อโหลดจาก server มาแล้ว ให้ล้าง autosave เก่าทิ้ง
          localStorage.removeItem('autosave-canvas-image');
        }
      })
      .catch((err) => {
        console.error('Error fetching /api/canvas/load:', err);
      });
  }, [loadId]);

  // ─── B: เช็กล็อกอิน ตอน mount ─────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        if (r.ok) setIsLoggedIn(true);
        else setIsLoggedIn(false);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  // ─── B1: ถ้าไม่มี loadId ให้โหลด autosaved image จาก localStorage ─────────
  useEffect(() => {
    if (loadId) return; // ถ้ามี loadId ให้ skip
    const savedDataUrl = localStorage.getItem('autosave-canvas-image');
    if (savedDataUrl) {
      // โหลดรูปจาก Autosave ลงใน CustomCanvas
      canvasRef.current?.loadImage(savedDataUrl);
    }
  }, [loadId]);

  // ─── C: saveToGallery (ส่งรูปขึ้น S3 + บันทึก metadata) ──────────────────
  const saveToGallery = async () => {
    if (!isLoggedIn) {
      if (confirm('Please log in first. Go to login page?')) {
        router.push('/login');
      }
      return;
    }
    if (!canvasRef.current) return;

    setSaving(true);
    try {
      // 1) Export Canvas → PNG Data URL
      const fullDataUrl = canvasRef.current.exportImage();

      // 2) สร้าง thumbnail ขนาด 200px
      const img = new Image();
      img.src = fullDataUrl;
      await img.decode();
      const thumbW = 200;
      const thumbH = Math.round((img.height / img.width) * thumbW);
      const offscreen = document.createElement('canvas');
      offscreen.width = thumbW;
      offscreen.height = thumbH;
      const offCtx = offscreen.getContext('2d')!;
      offCtx.drawImage(img, 0, 0, thumbW, thumbH);
      const thumbDataUrl = offscreen.toDataURL('image/png');

      // 3) ขอ presign URLs
      const presignRes = await fetch('/api/gallery/presign', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'png' }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        console.error('Presign failed:', presignData);
        setSaving(false);
        return;
      }
      const {
        full,
        thumb,
      }: {
        full: { presign: string; public: string };
        thumb: { presign: string; public: string };
      } = presignData;

      // 4) แปลง DataURL → Blob แล้วอัปโหลด (PUT)
      const blobFull = await (await fetch(fullDataUrl)).blob();
      const blobThumb = await (await fetch(thumbDataUrl)).blob();
      const up1 = await fetch(full.presign, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: blobFull,
      });
      if (!up1.ok) {
        console.error('Upload full failed:', await up1.text());
        setSaving(false);
        return;
      }
      const up2 = await fetch(thumb.presign, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: blobThumb,
      });
      if (!up2.ok) {
        console.error('Upload thumb failed:', await up2.text());
        setSaving(false);
        return;
      }

      // 5) POST metadata เข้า MongoDB
      const createRes = await fetch('/api/gallery/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: drawingName.trim() || 'untitled',
          imageUrl: full.public,
          thumbnailUrl: thumb.public,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        console.error('Create metadata failed:', createData);
        setSaving(false);
        return;
      }

      // 6) สำเร็จ → ล้าง autosave + redirect กลับหน้า Gallery
      setSaving(false);
      localStorage.removeItem('autosave-canvas-image');
      router.push('/');
    } catch (err) {
      console.error('saveToGallery error:', err);
      setSaving(false);
    }
  };

  // ─── Export / Clear ───────────────────────────────────────────────────────
  const handleExport = (type: 'png' | 'jpeg') => {
    const dataUrl = canvasRef.current?.exportImage();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${drawingName}.${type}`;
    a.click();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    localStorage.removeItem('autosave-canvas-image');
  };

  return (
    <div className="h-screen overflow-hidden grid grid-rows-[auto_1fr] grid-cols-[auto_1fr]">
      {/* Topbar (row 1 / col-span-full) */}
      <div className="row-start-1 col-span-full">
        <Topbar
          drawingName={drawingName}
          setDrawingName={setDrawingName}
          onUndo={() => canvasRef.current?.undo()}
          onRedo={() => canvasRef.current?.redo()}
          onClear={handleClear}
          onSave={saveToGallery}
          onExport={handleExport}
          disabledSave={!isLoggedIn || saving}
        />
      </div>

      {/* Toolbar (row 2 / col 1) */}
      <div className="row-start-2 col-start-1">
        <Toolbar
          tool={tool}
          setTool={setTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          setPrimaryColor={setPrimaryColor}
          setSecondaryColor={setSecondaryColor}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
        />
      </div>

      {/* CustomCanvas (row 2 / col 2) */}
      <div className="row-start-2 col-start-2 flex justify-center items-center">
        <CustomCanvas
          ref={canvasRef}
          tool={tool}
          brushSize={brushSize}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          activeColor={activeColor}
        />
      </div>
    </div>
  );
}
