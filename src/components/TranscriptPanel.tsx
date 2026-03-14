'use client';

import React, { useRef, useEffect } from 'react';
import type { TranscriptEntry } from '@/lib/types';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export default function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin"
    >
      {entries.length === 0 ? (
        <div className="text-center text-white/30 py-8 text-sm">
          <p>Conversation will appear here...</p>
          <p className="mt-2 text-xs text-white/20">
            Connect and start speaking to Jarvis
          </p>
        </div>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                entry.role === 'user'
                  ? 'bg-[#E63939] text-white rounded-br-sm'
                  : 'bg-white/10 text-white/90 rounded-bl-sm border border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  {entry.role === 'user' ? 'You' : 'Jarvis'}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{entry.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
