'use client';

import React, { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
  color?: string;
}

export default function WaveformVisualizer({
  isActive,
  color = '#E63939',
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (isActive) {
        phaseRef.current += 0.05;
        const bars = 32;
        const barWidth = w / bars - 2;

        for (let i = 0; i < bars; i++) {
          const amplitude =
            Math.sin(phaseRef.current + i * 0.3) * 0.4 +
            Math.sin(phaseRef.current * 1.5 + i * 0.5) * 0.3 +
            0.3;
          const barHeight = Math.max(4, amplitude * h * 0.8);
          const x = i * (barWidth + 2);
          const y = (h - barHeight) / 2;

          ctx.fillStyle = color;
          ctx.globalAlpha = 0.6 + amplitude * 0.4;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else {
        // Flat line when inactive
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive, color]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={48}
      className="w-full h-12 rounded-lg"
      style={{ background: 'rgba(0,0,0,0.3)' }}
    />
  );
}
