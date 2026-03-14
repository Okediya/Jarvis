/**
 * AudioWorklet processor for model audio playback.
 * Receives PCM16 buffers from the main thread and plays them.
 * Supports instant stop (barge-in) via a 'stop' message.
 */
class PlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._queue = [];
    this._cursor = 0;
    this._currentBuffer = null;

    this.port.onmessage = (e) => {
      if (e.data.type === 'audio') {
        const int16 = new Int16Array(e.data.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 0x8000;
        }
        this._queue.push(float32);
      } else if (e.data.type === 'stop') {
        this._queue = [];
        this._currentBuffer = null;
        this._cursor = 0;
      }
    };
  }

  process(_inputs, outputs) {
    const output = outputs[0];
    if (!output || !output[0]) return true;

    const channel = output[0];

    for (let i = 0; i < channel.length; i++) {
      if (!this._currentBuffer || this._cursor >= this._currentBuffer.length) {
        if (this._queue.length > 0) {
          this._currentBuffer = this._queue.shift();
          this._cursor = 0;
        } else {
          this._currentBuffer = null;
          channel[i] = 0;
          continue;
        }
      }
      channel[i] = this._currentBuffer[this._cursor++];
    }

    // Notify main thread if playback queue is empty
    if (!this._currentBuffer && this._queue.length === 0) {
      this.port.postMessage({ type: 'idle' });
    }

    return true;
  }
}

registerProcessor('player-processor', PlayerProcessor);
