import { useEffect } from 'react';
import { CustomCanvasRef } from './CustomCanvas';

export const useCustomAutoSave = (canvasRef: React.RefObject<CustomCanvasRef>) => {
  useEffect(() => {
    const interval = setInterval(() => {
      const image = canvasRef.current?.exportImage();
      if (image) {
        localStorage.setItem('autosave-canvas-image', image);
        console.log('🧠 Auto-saved canvas');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [canvasRef]);
};

export const useResizeObserver = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) => {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(callback);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, callback]);
};
