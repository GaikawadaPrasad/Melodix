import { useRef, useEffect, useCallback } from 'react';

export function useVisualizer(audioRef, canvasRef, isPlaying) {
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const animRef = useRef(null);
  const sourceRef = useRef(null);
  const audioCtxRef = useRef(null);

  const init = useCallback(() => {
    if (!audioRef.current || audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    } catch (e) {
      console.warn('Visualizer init error:', e);
    }
  }, [audioRef]);

  useEffect(() => {
    if (isPlaying && !audioCtxRef.current) init();
  }, [isPlaying, init]);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !analyserRef.current) {
      cancelAnimationFrame(animRef.current);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const hue = 260 + (i / bufferLength) * 60;
        ctx.fillStyle = `hsla(${hue}, 80%, 65%, 0.9)`;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 1, barHeight, 2);
        ctx.fill();
        x += barWidth + 1;
      }
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, canvasRef]);

  // Resume AudioContext on user interaction
  const resume = useCallback(() => {
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
  }, []);

  return { resume };
}
