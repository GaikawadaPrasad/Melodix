import { useRef, useEffect } from 'react';
import { useVisualizer } from '../../hooks/useVisualizer';
import { usePlayerStore } from '../../store/playerStore';

export default function AudioVisualizer({ audioRef, height = 40, className = '' }) {
  const canvasRef = useRef(null);
  const { isPlaying } = usePlayerStore();
  const { resume } = useVisualizer(audioRef, canvasRef, isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Resize canvas
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={resume}
      style={{ height }}
      className={`w-full cursor-pointer ${className}`}
    />
  );
}
