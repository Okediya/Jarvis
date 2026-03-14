/* ────────────────────────────────────────────
   Jarvis — shared TypeScript types
   ──────────────────────────────────────────── */

// ─── Prototype data types ────────────────────

export type PrototypeType = 'hardware' | 'software' | 'navigation' | 'teaching';

export interface SceneObject {
  id: string;
  geometry: 'box' | 'sphere' | 'cylinder' | 'torus' | 'cone' | 'plane';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
  animate?: {
    type: 'rotate' | 'float' | 'pulse';
    speed?: number;
    axis?: 'x' | 'y' | 'z';
  };
  children?: SceneObject[];
}

export interface SceneData {
  objects: SceneObject[];
  camera?: { position: [number, number, number]; lookAt?: [number, number, number] };
  background?: string;
  ambientLight?: number;
}

export interface NavigationData {
  origin: { lat: number; lng: number; label: string };
  destination: { lat: number; lng: number; label: string };
  waypoints?: { lat: number; lng: number; label?: string }[];
  steps?: string[];
  zoom?: number;
}

export interface TeachingData {
  explanation: string;
  keyPoints: string[];
  highlights?: { x: number; y: number; label: string }[];
}

export interface PrototypeData {
  type: PrototypeType;
  scene?: SceneData;
  code?: string;
  navigation?: NavigationData;
  teaching?: TeachingData;
}

// ─── Conversation / transcript ───────────────

export interface TranscriptEntry {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// ─── Input / mode ────────────────────────────

export type InputMode = 'audio' | 'video' | 'both';
export type InputSource = 'webcam' | 'screen';

// ─── Connection state ────────────────────────

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
