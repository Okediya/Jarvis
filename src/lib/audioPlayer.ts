/**
 * AudioPlayer — wraps AudioWorklet for model audio playback.
 * Receives PCM16 buffers and plays them via AudioWorklet.
 * Supports instant stop for barge-in interruptions.
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private _isPlaying = false;
  private onPlaybackStateChange: ((playing: boolean) => void) | null = null;

  async init(onPlaybackStateChange?: (playing: boolean) => void): Promise<void> {
    this.onPlaybackStateChange = onPlaybackStateChange || null;
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    await this.audioContext.audioWorklet.addModule('/audio/player-processor.js');
    this.workletNode = new AudioWorkletNode(this.audioContext, 'player-processor');

    this.workletNode.port.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'idle' && this._isPlaying) {
        this._isPlaying = false;
        this.onPlaybackStateChange?.(false);
      }
    };

    this.workletNode.connect(this.audioContext.destination);
  }

  play(pcm16Buffer: ArrayBuffer): void {
    if (!this.workletNode) return;
    this._isPlaying = true;
    this.onPlaybackStateChange?.(true);
    this.workletNode.port.postMessage({ type: 'audio', buffer: pcm16Buffer }, [pcm16Buffer]);
  }

  stop(): void {
    if (!this.workletNode) return;
    this.workletNode.port.postMessage({ type: 'stop' });
    this._isPlaying = false;
    this.onPlaybackStateChange?.(false);
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  destroy(): void {
    this.stop();
    this.workletNode?.disconnect();
    this.audioContext?.close();
    this.workletNode = null;
    this.audioContext = null;
  }
}
