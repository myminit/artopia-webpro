'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const canvasRef = useRef<CustomCanvasRef>(null);

  const [tool, setTool]           = useState(TOOL_TYPE.BRUSH);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const [primaryColor, setPrimaryColor]     = useState(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY_COLOR);
  const [activeColor, setActiveColor]       = useState<'primary'|'secondary'>('primary');
  const [drawingName, setDrawingName]       = useState('');
  const [isLoggedIn, setIsLoggedIn]         = useState(false);

  useCustomAutoSave(canvasRef);

  // load autosave or gallery-load on mount
  useEffect(() => {
    const gallery = localStorage.getItem('gallery-load-url');
    if (gallery) {
      canvasRef.current?.loadImage(gallery);
      localStorage.removeItem('gallery-load-url');
    } else {
      const auto = localStorage.getItem('autosave-canvas-image');
      if (auto && confirm('Found unsaved drawing. Load it?')) {
        canvasRef.current?.loadImage(auto);
      }
    }
  }, []);

  // check login
  useEffect(() => {
    fetch('/api/auth/me',{ credentials:'include' })
      .then(r => r.ok ? setIsLoggedIn(true) : setIsLoggedIn(false))
      .catch(()=>setIsLoggedIn(false));
  }, []);

  const handleExport = (type:'png'|'jpeg') => {
    const dataUrl = canvasRef.current?.exportImage();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${drawingName||'Untitled'}.${type}`;
    a.click();
  };

  const handleSave = () => {
    if (!isLoggedIn) {
      if (confirm('Please log in first. Go to login page?')) {
        router.push('/login');
      }
      return;
    }
    // ... call your API to save
    localStorage.removeItem('autosave-canvas-image');
    alert('Saved to gallery!');
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    localStorage.removeItem('autosave-canvas-image');
  };

  return (
    <div className="h-screen overflow-hidden grid grid-rows-[auto_1fr] grid-cols-[auto_1fr]">
      <div className="row-start-1 col-span-full">
        <Topbar
          drawingName={drawingName}
          setDrawingName={setDrawingName}
          onUndo={()=>canvasRef.current?.undo()}
          onRedo={()=>canvasRef.current?.redo()}
          onClear={handleClear}
          onSave={handleSave}
          onExport={handleExport}
          disabledSave={!isLoggedIn}
        />
      </div>
      <div className="row-start-2 col-start-1">
        <Toolbar
          tool={tool} setTool={setTool}
          brushSize={brushSize} setBrushSize={setBrushSize}
          primaryColor={primaryColor} secondaryColor={secondaryColor}
          setPrimaryColor={setPrimaryColor} setSecondaryColor={setSecondaryColor}
          activeColor={activeColor} setActiveColor={setActiveColor}
        />
      </div>
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
