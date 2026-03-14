'use client';

import React from 'react';
import WaveformVisualizer from './WaveformVisualizer';
import TranscriptPanel from './TranscriptPanel';
import type { TranscriptEntry, InputMode, InputSource, ConnectionStatus } from '@/lib/types';

interface SidebarProps {
  status: ConnectionStatus;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  inputSource: InputSource;
  setInputSource: (source: InputSource) => void;
  transcript: TranscriptEntry[];
  isModelSpeaking: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onClear: () => void;
  error: string | null;
}

const EXAMPLE_PROMPTS = [
  '🏎️ Build a red sports car with spinning wheels',
  '✈️ Turn this into a flying airplane with wings',
  '📊 Create a fitness tracker dashboard web app',
  '🗺️ Navigate from Ibadan to Lagos airport',
  '🖥️ Share my screen and explain this webpage',
  '💻 Teach me what this code does',
  '📐 Explain this math diagram I\'m looking at',
];

export default function Sidebar({
  status,
  inputMode,
  setInputMode,
  inputSource,
  setInputSource,
  transcript,
  isModelSpeaking,
  onConnect,
  onDisconnect,
  onClear,
  error,
}: SidebarProps) {
  const isConnected = status === 'connected';

  return (
    <aside className="w-80 h-screen flex flex-col bg-black border-r border-white/10 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E63939] flex items-center justify-center shadow-lg shadow-[#E63939]/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">JARVIS</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Multimodal Agent</p>
          </div>
        </div>

        {/* Connect/Disconnect */}
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={status === 'connecting'}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
            isConnected
              ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              : status === 'connecting'
                ? 'bg-[#E63939]/50 text-white/60 cursor-wait'
                : 'bg-[#E63939] text-white hover:bg-[#d12f2f] shadow-lg shadow-[#E63939]/25'
          }`}
        >
          {status === 'connecting'
            ? '⏳ Connecting...'
            : isConnected
              ? '⏹ Disconnect'
              : '🎙️ Connect to Jarvis'}
        </button>

        {error && (
          <p className="mt-2 text-xs text-[#E63939] bg-[#E63939]/10 rounded-lg p-2">
            {error}
          </p>
        )}
      </div>

      {/* Mode Toggles */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div>
          <label className="text-white/50 text-[10px] uppercase tracking-widest font-semibold block mb-2">
            Input Mode
          </label>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(['audio', 'video', 'both'] as InputMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  inputMode === mode
                    ? 'bg-[#E63939] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {mode === 'audio' ? '🎤' : mode === 'video' ? '📹' : '🎤📹'}{' '}
                <span className="capitalize">{mode}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-white/50 text-[10px] uppercase tracking-widest font-semibold block mb-2">
            Input Source
          </label>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(['webcam', 'screen'] as InputSource[]).map((source) => (
              <button
                key={source}
                onClick={() => setInputSource(source)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  inputSource === source
                    ? 'bg-[#E63939] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {source === 'webcam' ? '📷' : '🖥️'}{' '}
                <span className="capitalize">{source === 'screen' ? 'Screen Share' : source}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="px-4 py-3 border-b border-white/10">
        <WaveformVisualizer isActive={isConnected && (isModelSpeaking || true)} />
      </div>

      {/* Transcript */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">
            Transcript
          </h2>
          {transcript.length > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <TranscriptPanel entries={transcript} />
      </div>

      {/* Example Prompts */}
      <div className="p-4 border-t border-white/10">
        <h2 className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-2">
          Try Saying
        </h2>
        <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <div
              key={i}
              className="px-2.5 py-1.5 text-[11px] text-white/60 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-default"
            >
              {prompt}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
