'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { PrototypeData } from '@/lib/types';

// Dynamic imports to avoid SSR issues with canvas/map
const HardwareEngine = dynamic(() => import('./engines/HardwareEngine'), { ssr: false });
const SoftwareEngine = dynamic(() => import('./engines/SoftwareEngine'), { ssr: false });
const NavigationEngine = dynamic(() => import('./engines/NavigationEngine'), { ssr: false });
const TeachingEngine = dynamic(() => import('./engines/TeachingEngine'), { ssr: false });

interface PrototypeViewerProps {
  prototype: PrototypeData | null;
  onClear: () => void;
}

export default function PrototypeViewer({ prototype, onClear }: PrototypeViewerProps) {
  if (!prototype) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/30">
        {/* Animated idle state */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full border-2 border-[#E63939]/20 flex items-center justify-center animate-pulse">
            <div className="w-24 h-24 rounded-full border border-[#E63939]/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#E63939]/10 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E63939"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
            </div>
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#E63939]" />
          </div>
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: '12s', animationDirection: 'reverse' }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        <h2 className="text-white/60 text-lg font-semibold mb-2">
          Ready to Create
        </h2>
        <p className="text-white/30 text-sm max-w-md text-center leading-relaxed">
          Connect and describe what you want to build. I can create 3D prototypes, web apps,
          navigation maps, or teach you about anything on your screen.
        </p>

        {/* Quick capabilities */}
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
          {[
            { icon: '🔧', label: '3D Hardware', desc: 'Physical prototypes' },
            { icon: '💻', label: 'Web Apps', desc: 'Software UIs' },
            { icon: '🗺️', label: 'Navigation', desc: 'Map routes' },
            { icon: '📖', label: 'Teaching', desc: 'Screen explanations' },
          ].map((cap) => (
            <div
              key={cap.label}
              className="px-3 py-2.5 bg-white/5 rounded-xl border border-white/5 text-center"
            >
              <span className="text-lg">{cap.icon}</span>
              <p className="text-white/70 text-xs font-medium mt-1">{cap.label}</p>
              <p className="text-white/30 text-[10px]">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Active engine */}
      {prototype.type === 'hardware' && prototype.scene && (
        <HardwareEngine scene={prototype.scene} />
      )}
      {prototype.type === 'software' && prototype.code && (
        <SoftwareEngine code={prototype.code} />
      )}
      {prototype.type === 'navigation' && prototype.navigation && (
        <NavigationEngine navigation={prototype.navigation} />
      )}
      {prototype.type === 'teaching' && prototype.teaching && (
        <TeachingEngine teaching={prototype.teaching} />
      )}

      {/* Tab indicator + Clear button */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-[1000]">
        <div className="px-3 py-1.5 bg-[#E63939]/90 backdrop-blur-sm rounded-lg text-xs text-white font-semibold capitalize shadow-lg">
          {prototype.type} Mode
        </div>
        <button
          onClick={onClear}
          className="px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg text-xs text-white/70 border border-white/10 hover:bg-white/10 transition-colors"
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
}
