'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  TOOL_TYPE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAX_HISTORY,
} from './constants';

export type CustomCanvasRef = {
  undo: () => void;
  redo: () => void;
  exportImage: () => string;
  clear: () => void;
  loadImage: (url: string) => void;
};

const CustomCanvas = forwardRef<CustomCanvasRef, {
  tool: TOOL_TYPE;
  brushSize: number;
  primaryColor: string;
  secondaryColor: string;
  activeColor: 'primary' | 'secondary';
}>(({ tool, brushSize, primaryColor, secondaryColor, activeColor }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapRef   = useRef<ImageData|null>(null);

  const [paths, setPaths]         = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [drawing, setDrawing]     = useState(false);
  const [startPos, setStartPos]   = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom]           = useState(1);
  const [offset, setOffset]       = useState({ x: 0, y: 0 });
  const [panning, setPanning]     = useState(false);

  useImperativeHandle(ref, () => ({ undo, redo, exportImage, clear, loadImage }));

  // Initialize blank canvas + history
  useEffect(() => {
    const c = canvasRef.current!;
    c.width  = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    saveHistory(ctx);
  }, []);

  // Mouse-wheel → zoom
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(z => Math.min(3, Math.max(0.5, z - e.deltaY * 0.001)));
    };
    c.addEventListener('wheel', onWheel);
    return () => c.removeEventListener('wheel', onWheel);
  }, []);

  // Map screen mouse → canvas coords
  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top)  / zoom,
    };
  };

  const getColor = () =>
    tool === TOOL_TYPE.ERASER
      ? '#fff'
      : activeColor === 'primary'
      ? primaryColor
      : secondaryColor;

  // Make round cursor of given diameter
  const makeCursor = (size: number) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
                `<circle cx="${size/2}" cy="${size/2}" r="${size/2-1}" ` +
                `fill="none" stroke="black" stroke-width="2"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${size/2} ${size/2}, auto`;
  };
  const cursorStyle =
    tool === TOOL_TYPE.BRUSH || tool === TOOL_TYPE.ERASER
      ? makeCursor(brushSize * 2)
      : tool === TOOL_TYPE.MOVE
      ? 'grab'
      : 'crosshair';

  // --- Mouse event handlers ---

  const startDraw = (e: React.MouseEvent) => {
    const ctx = canvasRef.current!.getContext('2d')!;

    // Pan mode
    if (tool === TOOL_TYPE.MOVE) {
      setPanning(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    // Fill mode
    if (tool === TOOL_TYPE.FILL) {
      const { x, y } = getPos(e);
      floodFill(x, y, ctx);
      saveHistory(ctx);
      return;
    }

    // Shape preview snapshot
    if ([TOOL_TYPE.LINE, TOOL_TYPE.RECT, TOOL_TYPE.CIRCLE, TOOL_TYPE.TRIANGLE]
        .includes(tool)) {
      snapRef.current = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Brush/Eraser start
    const { x, y } = getPos(e);
    setStartPos({ x, y });
    setDrawing(true);
    if (tool === TOOL_TYPE.BRUSH || tool === TOOL_TYPE.ERASER) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent) => {
    const ctx = canvasRef.current!.getContext('2d')!;

    // Pan interaction
    if (tool === TOOL_TYPE.MOVE && panning && startPos) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
      setStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!drawing || !startPos) return;
    const { x, y } = getPos(e);

    // Common stroke style
    ctx.strokeStyle = getColor();
    ctx.lineWidth   = brushSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    // Brush/Eraser
    if (tool === TOOL_TYPE.BRUSH || tool === TOOL_TYPE.ERASER) {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

    // Shape preview
    if (snapRef.current) {
      ctx.putImageData(snapRef.current, 0, 0);
      const { x: sx, y: sy } = startPos;
      switch (tool) {
        case TOOL_TYPE.LINE:
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(x, y);
          ctx.stroke();
          break;
        case TOOL_TYPE.RECT:
          ctx.strokeRect(sx, sy, x - sx, y - sy);
          break;
        case TOOL_TYPE.CIRCLE: {
          const r = Math.hypot(x - sx, y - sy);
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        }
        case TOOL_TYPE.TRIANGLE:
          ctx.beginPath();
          ctx.moveTo(sx + (x - sx)/2, sy);
          ctx.lineTo(sx, y);
          ctx.lineTo(x, y);
          ctx.closePath();
          ctx.stroke();
          break;
      }
    }
  };

  const endDraw = (e: React.MouseEvent) => {
    const ctx = canvasRef.current!.getContext('2d')!;
    if (tool === TOOL_TYPE.MOVE && panning) {
      setPanning(false);
      return;
    }
    if (!drawing) return;
    setDrawing(false);
    setStartPos(null);
    saveHistory(ctx);
  };

  // --- History (undo/redo) ---

  const saveHistory = (ctx: CanvasRenderingContext2D) => {
    const snap = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    setPaths(p => {
      if (p.length === 0) return [snap];
      const blank = p[0], rest = p.slice(1);
      const clipped = rest.slice(-(MAX_HISTORY - 1));
      return [blank, ...clipped, snap];
    });
    setRedoStack([]);
  };

  const undo = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    if (paths.length < 2) return;
    const prev = [...paths], last = prev.pop()!;
    setPaths(prev);
    setRedoStack(r => [last, ...r]);
    ctx.putImageData(prev[prev.length - 1], 0, 0);
  };

  const redo = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    if (!redoStack.length) return;
    const [first, ...rest] = redoStack;
    setRedoStack(rest);
    setPaths(p => [...p, first]);
    ctx.putImageData(first, 0, 0);
  };

  // --- Export/Clear/Load ---

  const exportImage = () => canvasRef.current!.toDataURL('image/png');

  const clear = () => {
    const ctx = canvasRef.current!.getContext('2d')!;

    // 1. รีเซ็ต transform (ถ้ามี)
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 2. วาดพื้นหลังขาวทั้งแผ่น
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 3. รีเซ็ต Pan/Zoom
    setOffset({ x: 0, y: 0 });
    setZoom(1);

    // 4. เคลียร์ history เก่า แล้วบันทึก snapshot หน้าเปล่าใหม่
    setPaths([]);
    setRedoStack([]);
    saveHistory(ctx);
  };

  const loadImage = (url: string) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current!.getContext('2d')!;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      setPaths([]);
      setRedoStack([]);
      saveHistory(ctx);
    };
    img.src = url;
  };

  // --- Flood-fill with visited check ---
  function floodFill(x0: number, y0: number, ctx: CanvasRenderingContext2D) {
    const img = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = img.data;
    const w = CANVAS_WIDTH, h = CANVAS_HEIGHT;
    const idxOf = (x: number, y: number) => (y * w + x) * 4;
    const sx = Math.floor(x0), sy = Math.floor(y0);
    if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;
    const startIdx = idxOf(sx, sy);
    const target = `${data[startIdx]},${data[startIdx+1]},${data[startIdx+2]},${data[startIdx+3]}`;
    const hex = getColor().slice(1);
    const fillColor = [
      parseInt(hex.slice(0,2),16),
      parseInt(hex.slice(2,4),16),
      parseInt(hex.slice(4,6),16),
      255
    ];
    const visited = new Uint8Array(w * h);
    const stack: [number,number][] = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      if (x<0||x>=w||y<0||y>=h) continue;
      const pi = y*w + x;
      if (visited[pi]) continue;
      visited[pi] = 1;
      const di = pi*4;
      const pix = `${data[di]},${data[di+1]},${data[di+2]},${data[di+3]}`;
      if (pix !== target) continue;
      data[di]   = fillColor[0];
      data[di+1] = fillColor[1];
      data[di+2] = fillColor[2];
      data[di+3] = fillColor[3];
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
    ctx.putImageData(img, 0, 0);
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        border: '1px solid #ccc',
        background: '#fff',
        boxShadow: '0 0 4px rgba(0,0,0,0.1)',
        transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`,
        transformOrigin: 'top left',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          cursor: cursorStyle,
        }}
      />
    </div>
  );
});

CustomCanvas.displayName = 'CustomCanvas';
export default CustomCanvas;
