'use client';

import React, { useState, useRef, useEffect } from 'react';

type Props = {
  drawingName: string;
  setDrawingName: (n: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: (type: 'png'|'jpeg') => void;
  disabledSave: boolean;
};

export default function Topbar({
  drawingName,
  setDrawingName,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onExport,
  disabledSave,
}: Props) {
  const [showExport, setShowExport] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-white shadow px-6 py-3 flex items-center justify-between"
    >
      <div className="flex items-center space-x-2">
        <div className="text-2xl font-bold text-blue-600">🎨 Artopia</div>
        <button onClick={onUndo}  className="px-3 py-1 bg-gray-200 rounded">Undo</button>
        <button onClick={onRedo}  className="px-3 py-1 bg-gray-200 rounded">Redo</button>
        <button onClick={onClear} className="px-3 py-1 bg-gray-200 rounded">Clear</button>
      </div>
      <input
        type="text"
        className="border px-3 py-1 rounded w-64 text-center"
        placeholder="Untitled"
        value={drawingName}
        onChange={e => setDrawingName(e.target.value)}
      />
      <div className="flex items-center space-x-2">
        <div ref={wrapRef} className="relative inline-block">
          <button
            onClick={() => setShowExport(v => !v)}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Export
          </button>
          {showExport && (
            <div className="absolute top-full left-0 bg-white border shadow rounded mt-1">
              <button onClick={() => onExport('png')}  className="w-full px-3 py-1">PNG</button>
              <button onClick={() => onExport('jpeg')} className="w-full px-3 py-1">JPG</button>
            </div>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={disabledSave}
          className={`px-3 py-1 rounded ${
            disabledSave
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 text-white'
          }`}
        >
          Save to Gallery
        </button>
      </div>
    </header>
  );
}
