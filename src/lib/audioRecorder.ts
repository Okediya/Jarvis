/**
 * AudioRecorder — wraps AudioWorklet for mic capture.
 * Outputs PCM16 Int16Array chunks via a callback.
 */
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private onData: ((buffer: ArrayBuffer) => void) | null = null;

  async start(onData: (buffer: ArrayBuffer) => void): Promise<void> {
    this.onData = onData;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.audioContext = new AudioContext({ sampleRate: 16000 });
    await this.audioContext.audioWorklet.addModule('/audio/recorder-processor.js');

    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    this.workletNode = new AudioWorkletNode(this.audioContext, 'recorder-processor');

    this.workletNode.port.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'audio' && this.onData) {
        this.onData(e.data.buffer);
      }
    };

    this.sourceNode.connect(this.workletNode);
    this.workletNode.connect(this.audioContext.destination); // required for worklet to process
  }

  stop(): void {
    this.workletNode?.disconnect();
    this.sourceNode?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.audioContext?.close();
    this.stream = null;
    this.audioContext = null;
    this.sourceNode = null;
    this.workletNode = null;
    this.onData = null;
  }

  getAnalyserNode(): AnalyserNode | null {
    if (!this.audioContext || !this.sourceNode) return null;
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    this.sourceNode.connect(analyser);
    return analyser;
  }
}
