'use client';

import React, { useEffect, useRef, useState } from 'react';

interface VideoPreviewProps {
  stream: MediaStream | null;
  source: 'webcam' | 'screen';
}

export default function VideoPreview({ stream, source }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-xs text-white/60 hover:text-white hover:border-[#E63939]/50 transition-all flex items-center gap-2"
      >
        <span className="w-2 h-2 bg-[#E63939] rounded-full animate-pulse" />
        {source === 'screen' ? '🖥️ Screen' : '📹 Camera'}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 group animate-fade-in">
      <div className="relative rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/50 hover:border-[#E63939]/30 transition-all"
        style={{ width: source === 'screen' ? 320 : 200, aspectRatio: source === 'screen' ? '16/9' : '4/3' }}
      >
        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: source === 'webcam' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Overlay controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Label */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#E63939] rounded-full animate-pulse" />
            <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
              {source === 'screen' ? 'Screen Share' : 'Camera'} • Live
            </span>
          </div>

          {/* Minimize button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/60 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all text-xs"
          >
            ─
          </button>
        </div>

        {/* Live indicator (always visible) */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-md px-1.5 py-0.5">
          <span className="w-1.5 h-1.5 bg-[#E63939] rounded-full animate-pulse" />
          <span className="text-[9px] text-white/70 font-medium">LIVE</span>
        </div>
      </div>
    </div>
  );
}
