'use client';

import React from 'react';
import { useGeminiLive } from '@/hooks/useGeminiLive';
import Sidebar from '@/components/Sidebar';
import PrototypeViewer from '@/components/PrototypeViewer';
import StatusIndicator from '@/components/StatusIndicator';
import VideoPreview from '@/components/VideoPreview';

export default function Home() {
  const {
    status,
    connect,
    disconnect,
    transcript,
    currentPrototype,
    isModelSpeaking,
    inputMode,
    setInputMode,
    inputSource,
    setInputSource,
    clearPrototype,
    error,
    videoStream,
  } = useGeminiLive();

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        status={status}
        inputMode={inputMode}
        setInputMode={setInputMode}
        inputSource={inputSource}
        setInputSource={setInputSource}
        transcript={transcript}
        isModelSpeaking={isModelSpeaking}
        onConnect={connect}
        onDisconnect={disconnect}
        onClear={clearPrototype}
        error={error}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/50 backdrop-blur-sm shrink-0">
          <StatusIndicator
            status={status}
            isModelSpeaking={isModelSpeaking}
            inputMode={inputMode}
            inputSource={inputSource}
          />

          <div className="flex items-center gap-2">
            {currentPrototype && (
              <div className="flex items-center gap-2 text-xs">
                {(['hardware', 'software', 'navigation', 'teaching'] as const).map((type) => (
                  <span
                    key={type}
                    className={`px-2 py-1 rounded-md capitalize transition-colors ${
                      currentPrototype.type === type
                        ? 'bg-[#E63939] text-white'
                        : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Prototype viewer */}
        <div className="flex-1 overflow-hidden">
          <PrototypeViewer prototype={currentPrototype} onClear={clearPrototype} />
        </div>
      </main>

      {/* Video Preview PIP */}
      <VideoPreview stream={videoStream} source={inputSource} />
    </div>
  );
}

