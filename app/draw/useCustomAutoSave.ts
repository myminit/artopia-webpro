import { useEffect } from 'react';
import { CustomCanvasRef } from './CustomCanvas';

export const useCustomAutoSave = (canvasRef: React.RefObject<CustomCanvasRef>) => {
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const dataUrl = canvasRef.current?.exportImage();
        if (dataUrl) localStorage.setItem('autosave-canvas-image', dataUrl);
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [canvasRef]);
};
