/**
 * AudioWorklet processor for microphone recording.
 * Captures PCM16 audio at the AudioContext sample rate (usually 48 kHz)
 * and posts Int16 buffers to the main thread.
 */
class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._bufferSize = 2048;
    this._buffer = new Float32Array(this._bufferSize);
    this._bytesWritten = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];

    for (let i = 0; i < channelData.length; i++) {
      this._buffer[this._bytesWritten++] = channelData[i];
      if (this._bytesWritten >= this._bufferSize) {
        this._flush();
      }
    }

    return true;
  }

  _flush() {
    const int16 = new Int16Array(this._bytesWritten);
    for (let i = 0; i < this._bytesWritten; i++) {
      const s = Math.max(-1, Math.min(1, this._buffer[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    this.port.postMessage({ type: 'audio', buffer: int16.buffer }, [int16.buffer]);
    this._bytesWritten = 0;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
