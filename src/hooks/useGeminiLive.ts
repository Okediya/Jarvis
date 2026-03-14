'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Session, LiveConnectConfig, Type, FunctionDeclaration } from '@google/genai';
import { AudioRecorder } from '@/lib/audioRecorder';
import { AudioPlayer } from '@/lib/audioPlayer';
import type {
  PrototypeData,
  TranscriptEntry,
  InputMode,
  InputSource,
  ConnectionStatus,
} from '@/lib/types';
import { getApiKey } from '@/app/actions';
const MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'update_prototype',
    description:
      'Generate or update a real-time visual prototype based on the user request. Use type "hardware" for 3D physical objects (cars, planes, buildings, gadgets), "software" for web UIs/dashboards/apps, "navigation" for map routes and directions, "teaching" for explaining on-screen content.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: 'The type of prototype to generate (hardware, software, navigation, teaching)',
        },
        scene: {
          type: Type.OBJECT,
          description: 'For hardware type: 3D scene with objects array',
          properties: {
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  geometry: {
                    type: Type.STRING,
                    description: 'box, sphere, cylinder, torus, cone, plane',
                  },
                  position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  rotation: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  scale: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  color: { type: Type.STRING },
                  metalness: { type: Type.NUMBER },
                  roughness: { type: Type.NUMBER },
                  animate: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'rotate, float, pulse' },
                      speed: { type: Type.NUMBER },
                      axis: { type: Type.STRING, description: 'x, y, z' },
                    },
                  },
                },
                required: ['id', 'geometry', 'position', 'color'],
              },
            },
            background: { type: Type.STRING },
            ambientLight: { type: Type.NUMBER },
          },
        },
        code: {
          type: Type.STRING,
          description: 'For software type: complete HTML/CSS/JS code for the web app',
        },
        navigation: {
          type: Type.OBJECT,
          description: 'For navigation type: route data',
          properties: {
            origin: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                label: { type: Type.STRING },
              },
            },
            destination: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                label: { type: Type.STRING },
              },
            },
            waypoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                },
              },
            },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            zoom: { type: Type.NUMBER },
          },
        },
        teaching: {
          type: Type.OBJECT,
          description: 'For teaching type: explanation and key points about what is on screen',
          properties: {
            explanation: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
      required: ['type'],
    },
  },
];

const SYSTEM_INSTRUCTION = `You are Jarvis, an advanced multimodal AI assistant for the Gemini Live Agent Challenge hackathon.
You can build real-time visual prototypes by calling the update_prototype tool.

CAPABILITIES:
1. **Hardware Prototypes (3D)**: Build 3D objects like cars, planes, buildings, gadgets. Use type "hardware" with a scene containing objects with geometry (box, sphere, cylinder, torus, cone, plane), position, color, scale, and optional animations.
2. **Software Prototypes (Web Apps)**: Generate web UIs, dashboards, apps. Use type "software" with complete HTML code including inline CSS and JavaScript.
3. **Navigation (Maps)**: Show routes on a map. Use type "navigation" with origin, destination, optional waypoints, and step-by-step directions.
4. **Teaching (Visual Teacher)**: When the user shares their screen, explain what you see. Use type "teaching" with explanation and keyPoints.

RULES:
- Always call update_prototype when the user asks to build, create, show, make, design, display, navigate, explain, or teach.
- For hardware prototypes, use realistic colors and multiple objects to create detailed scenes.
- For software prototypes, generate complete, self-contained HTML with modern styling (use Tailwind CDN).
- For navigation, use actual coordinate values for the locations mentioned.
- For teaching, provide clear, structured explanations with key points.
- You can iteratively update prototypes — each call replaces the current prototype.
- Respond conversationally AND call the tool. Keep spoken responses brief but helpful.`;

export interface UseGeminiLiveReturn {
  status: ConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  transcript: TranscriptEntry[];
  currentPrototype: PrototypeData | null;
  isModelSpeaking: boolean;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  inputSource: InputSource;
  setInputSource: (source: InputSource) => void;
  clearPrototype: () => void;
  error: string | null;
  videoStream: MediaStream | null;
}

export function useGeminiLive(): UseGeminiLiveReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentPrototype, setCurrentPrototype] = useState<PrototypeData | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('audio');
  const [inputSource, setInputSource] = useState<InputSource>('webcam');
  const [error, setError] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isConnectedRef = useRef(false);
  const isProcessingToolCallRef = useRef(false);

  const addTranscript = useCallback((role: 'user' | 'model', text: string) => {
    if (!text.trim()) return;
    setTranscript((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, text: text.trim(), timestamp: Date.now() },
    ]);
  }, []);

  const captureVideoFrame = useCallback((): string | null => {
    const stream = videoStreamRef.current;
    if (!stream) return null;

    const track = stream.getVideoTracks()[0];
    if (!track) return null;

    try {
      // Use ImageCapture if available
      const canvas = document.createElement('canvas');
      const video = document.createElement('video');
      video.srcObject = stream;
      video.width = 640;
      video.height = 480;

      // We'll try the ImageCapture API or fallback
      if ('ImageCapture' in window) {
        // Return null and use the interval-based approach with canvas
      }

      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, 640, 480);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      return dataUrl.split(',')[1]; // base64 portion
    } catch {
      return null;
    }
  }, []);

  const startVideoCapture = useCallback(
    async (mode: InputMode, source: InputSource) => {
      if (mode === 'audio') return;

      try {
        let stream: MediaStream;
        if (source === 'screen') {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 1280, height: 720, frameRate: 1 },
            audio: false,
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, frameRate: 2 },
          });
        }
        videoStreamRef.current = stream;
        setVideoStream(stream);

        // Create a hidden video element for frame capture
        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();

        // Send frames every 2 seconds
        videoIntervalRef.current = setInterval(async () => {
          if (!sessionRef.current || !isConnectedRef.current) return;
          if (isProcessingToolCallRef.current) return; // Skip video during tool call
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(video, 0, 0, 640, 480);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
            const base64 = dataUrl.split(',')[1];

            await sessionRef.current.sendRealtimeInput({
              media: {
                mimeType: 'image/jpeg',
                data: base64,
              },
            });
          } catch (err) {
            console.error('Frame capture error:', err);
          }
        }, 2000);
      } catch (err) {
        console.error('Video capture error:', err);
        setError(
          source === 'screen'
            ? 'Screen share permission denied. Please allow screen sharing.'
            : 'Camera permission denied. Please allow camera access.'
        );
      }
    },
    []
  );

  const stopVideoCapture = useCallback(() => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
      setVideoStream(null);
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnectedRef.current) return;
    setError(null);
    setStatus('connecting');

    try {
      const apiKey = await getApiKey();
      if (!apiKey) {
        throw new Error('API Key is missing. Please add GEMINI_API_KEY to your Cloud Run environment variables.');
      }

      const ai = new GoogleGenAI({ apiKey });

      // Initialize audio player
      const player = new AudioPlayer();
      await player.init((playing) => setIsModelSpeaking(playing));
      playerRef.current = player;

      // Configure the live session
      const config: LiveConnectConfig = {
        responseModalities: [Modality.AUDIO],
        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Kore',
            },
          },
        },
      };

      // Create a promise that resolves when onopen fires
      let resolveOpen: () => void;
      let rejectOpen: (err: Error) => void;
      const openPromise = new Promise<void>((resolve, reject) => {
        resolveOpen = resolve;
        rejectOpen = reject;
      });

      const session = await ai.live.connect({
        model: MODEL,
        config,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            setStatus('connected');
            isConnectedRef.current = true;
            resolveOpen();
          },
          onmessage: (message: any) => {
            // Handle audio data from serverContent.modelTurn.parts[].inlineData
            const content = message.serverContent;
            if (content?.modelTurn?.parts) {
              for (const part of content.modelTurn.parts) {
                if (part.inlineData?.data && playerRef.current) {
                  const audioData = part.inlineData.data;
                  const binaryStr = atob(audioData);
                  const bytes = new Uint8Array(binaryStr.length);
                  for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                  }
                  playerRef.current.play(bytes.buffer);
                  setIsModelSpeaking(true);
                }
                // Handle text parts
                if (part.text) {
                  addTranscript('model', part.text);
                }
              }
            }

            // Handle tool calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls) {
                // PAUSE audio input while processing tool call to avoid 1008 error
                isProcessingToolCallRef.current = true;
                console.log('Tool call received, pausing audio input');

                for (const fc of functionCalls) {
                  if (fc.name === 'update_prototype' && fc.args) {
                    const prototypeData = fc.args as unknown as PrototypeData;
                    setCurrentPrototype(prototypeData);
                  }
                }

                // Send tool response
                session.sendToolResponse({
                  functionResponses: functionCalls.map((fc: any) => ({
                    id: fc.id,
                    name: fc.name,
                    response: { success: true, message: 'Prototype updated successfully' },
                  })),
                });

                // RESUME audio input after tool response is sent
                isProcessingToolCallRef.current = false;
                console.log('Tool response sent, resuming audio input');
              }
            }

            // Handle turn complete
            if (message.serverContent?.turnComplete) {
              setIsModelSpeaking(false);
            }
          },
          onerror: (error: any) => {
            console.error('Gemini Live error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            setError(`Connection error: ${error.message || error.toString?.() || 'Unknown error'}`);
            setStatus('error');
            rejectOpen(new Error(error.message || 'WebSocket error'));
          },
          onclose: (e: any) => {
            const code = e?.code ?? 'unknown';
            const reason = e?.reason ?? 'no reason provided';
            console.log(`Gemini Live session closed — code: ${code}, reason: ${reason}`);
            console.log('Full close event:', e);
            isConnectedRef.current = false;
            if (code !== 1000) {
              // Abnormal close — show the reason to the user
              setError(`Session closed (code ${code}): ${reason}`);
              setStatus('error');
            } else {
              setStatus('disconnected');
            }
            // Stop recorder to prevent sending into a dead socket
            recorderRef.current?.stop();
            recorderRef.current = null;
            rejectOpen(new Error(`Session closed before open (code ${code}): ${reason}`));
          },
        },
      });

      sessionRef.current = session;

      // Wait for the WebSocket to actually be open before starting media
      await openPromise;

      // Double-check: if connection was lost during the await, bail out
      if (!isConnectedRef.current) {
        console.warn('Connection lost before media could start');
        return;
      }

      // Start audio recording only after connection is confirmed open
      const recorder = new AudioRecorder();
      await recorder.start(async (buffer: ArrayBuffer) => {
        // Guard: only send if still connected AND not processing a tool call
        if (!sessionRef.current || !isConnectedRef.current) return;
        if (isProcessingToolCallRef.current) return; // Skip audio during tool call

        try {
          // Barge-in: only interrupt if the user is actually speaking loudly
          // Measure RMS energy of the audio buffer as a simple VAD
          if (playerRef.current?.isPlaying) {
            const int16 = new Int16Array(buffer);
            let sumSquares = 0;
            for (let i = 0; i < int16.length; i++) {
              sumSquares += int16[i] * int16[i];
            }
            const rms = Math.sqrt(sumSquares / int16.length);
            // Threshold: ~500 on Int16 scale filters out background noise
            if (rms > 500) {
              console.log('Barge-in detected (RMS:', Math.round(rms), ')');
              playerRef.current.stop();
              setIsModelSpeaking(false);
            }
          }

          // Convert Int16 buffer to base64
          const uint8 = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          const base64 = btoa(binary);

          await sessionRef.current.sendRealtimeInput({
            media: {
              mimeType: 'audio/pcm;rate=16000',
              data: base64,
            },
          });
        } catch (err: any) {
          // Gracefully handle closed socket errors
          if (err?.message?.includes('CLOSING') || err?.message?.includes('CLOSED')) {
            console.warn('WebSocket closed, stopping recorder');
            recorderRef.current?.stop();
            recorderRef.current = null;
            isConnectedRef.current = false;
            setStatus('disconnected');
          } else {
            console.error('Audio send error:', err);
          }
        }
      });
      recorderRef.current = recorder;

      // Start video capture if needed
      await startVideoCapture(inputMode, inputSource);
    } catch (err) {
      console.error('Connection error:', err);
      setError(`Failed to connect: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('error');
    }
  }, [inputMode, inputSource, addTranscript, startVideoCapture]);

  const disconnect = useCallback(() => {
    isConnectedRef.current = false;
    recorderRef.current?.stop();
    recorderRef.current = null;
    playerRef.current?.destroy();
    playerRef.current = null;
    stopVideoCapture();
    sessionRef.current?.close();
    sessionRef.current = null;
    setStatus('disconnected');
    setIsModelSpeaking(false);
  }, [stopVideoCapture]);

  const clearPrototype = useCallback(() => {
    setCurrentPrototype(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Handle mode/source changes while connected
  useEffect(() => {
    if (!isConnectedRef.current) return;
    stopVideoCapture();
    startVideoCapture(inputMode, inputSource);
  }, [inputMode, inputSource, stopVideoCapture, startVideoCapture]);

  return {
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
  };
}
