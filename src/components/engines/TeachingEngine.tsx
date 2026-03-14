'use client';

import React from 'react';
import type { TeachingData } from '@/lib/types';

interface TeachingEngineProps {
  teaching: TeachingData;
}

export default function TeachingEngine({ teaching }: TeachingEngineProps) {
  return (
    <div className="w-full h-full flex flex-col bg-black/50 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#E63939]/20 border border-[#E63939]/30 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E63939" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Visual Teacher</h2>
          <p className="text-white/40 text-xs">Explaining your screen content</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-5 mb-6">
        <h3 className="text-[#E63939] text-xs uppercase tracking-widest font-semibold mb-3">
          Explanation
        </h3>
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
          {teaching.explanation}
        </p>
      </div>

      {/* Key Points */}
      {teaching.keyPoints && teaching.keyPoints.length > 0 && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <h3 className="text-[#E63939] text-xs uppercase tracking-widest font-semibold mb-3">
            Key Points
          </h3>
          <div className="space-y-3">
            {teaching.keyPoints.map((point, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 shrink-0 rounded-lg bg-[#E63939]/20 border border-[#E63939]/30 flex items-center justify-center">
                  <span className="text-[#E63939] text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed pt-0.5">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights overlay placeholder */}
      {teaching.highlights && teaching.highlights.length > 0 && (
        <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-5">
          <h3 className="text-[#E63939] text-xs uppercase tracking-widest font-semibold mb-3">
            Highlighted Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {teaching.highlights.map((h, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-[#E63939]/10 border border-[#E63939]/20 rounded-full text-xs text-[#E63939]"
              >
                📌 {h.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer tip */}
      <div className="mt-auto pt-6">
        <div className="px-4 py-3 bg-[#E63939]/5 rounded-xl border border-[#E63939]/10">
          <p className="text-xs text-white/40">
            💡 <span className="text-white/60">Tip:</span> Keep sharing your screen and ask
            follow-up questions. Jarvis maintains full context of the teaching session.
          </p>
        </div>
      </div>
    </div>
  );
}
