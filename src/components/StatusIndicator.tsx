'use client';

import React from 'react';
import type { ConnectionStatus } from '@/lib/types';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  isModelSpeaking: boolean;
  inputMode: string;
  inputSource: string;
}

export default function StatusIndicator({
  status,
  isModelSpeaking,
  inputMode,
  inputSource,
}: StatusIndicatorProps) {
  const statusConfig = {
    disconnected: { color: 'bg-white/20', label: 'Disconnected', pulse: false },
    connecting: { color: 'bg-yellow-500', label: 'Connecting...', pulse: true },
    connected: { color: 'bg-green-500', label: 'Connected', pulse: false },
    error: { color: 'bg-[#E63939]', label: 'Error', pulse: false },
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block w-2 h-2 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}
        />
        <span className="text-white/70">{config.label}</span>
      </div>

      {/* Mode indicator */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
        <span className="text-white/50">Mode:</span>
        <span className="text-white font-medium capitalize">{inputMode}</span>
      </div>

      {/* Input source */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
        <span className="text-white/50">Source:</span>
        <span className="text-white font-medium capitalize">{inputSource}</span>
      </div>

      {/* Speaking indicator */}
      {isModelSpeaking && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E63939]/20 border border-[#E63939]/30">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E63939] animate-pulse" />
          <span className="text-[#E63939] font-medium">Jarvis Speaking</span>
        </div>
      )}
    </div>
  );
}
