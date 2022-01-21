const PhantomCore = require("phantom-core");

const _instances = {};

// TODO: Borrow algorithms from: https://github.com/zenOSmosis/js-shell/blob/master/frontend/src/process/ClientAudioWorkerProcess/ClientAudioWorkerProcess.js

// const EVT_AVERAGE_AUDIO_LEVEL_CHANGED = "audio-level-changed";

class AudioAnalyserWorker extends PhantomCore {
  /**
   * @param {string} nativeUUID The UUID of the associated NativeAudioMediaStreamTrackLevelMonitor
   * instance
   */
  constructor(nativeUUID) {
    const cachedWorker = _instances[nativeUUID];

    if (cachedWorker) {
      return cachedWorker;
    }

    super();

    this._nativeUUID = nativeUUID;

    this._audioLevel = 0;
  }

  // TODO: Refactor and document
  /**
   * @param {Uint8Array} samples
   */
  addSamples(samples) {
    const rms = this.getRootMeanSquare(samples);
    const log2Rms = rms && Math.log2(rms);

    // Audio audioLevel ranges from 0 (silence) to 10 (loudest).
    // let nextAudioLevel = Math.ceil(log2Rms); // Our version; shows quieter, emits more often
    let nextAudioLevel = Math.ceil((10 * log2Rms) / 8); // Twilio version; shows louder

    // Constrain nextAudioLevel between 0 - 10
    if (nextAudioLevel < 0) {
      nextAudioLevel = 0;
    } else if (nextAudioLevel > 10) {
      nextAudioLevel = 10;
    }

    // TODO: Refactor
    self.postMessage({ nativeUUID: this._nativeUUID, rms });
  }

  /**
   * @param {Uint8Array} samples
   * @return {number}
   */
  getRootMeanSquare(samples) {
    const sumSq = samples.reduce((sumSq, sample) => sumSq + sample * sample, 0);
    return Math.sqrt(sumSq / samples.length);
  }
}

// TODO: Build accordingly
// TODO: Implement ability to destruct worker
self.onmessage = function (evt) {
  const { uuid, samples } = evt.data;

  const analyzer = new AudioAnalyserWorker(uuid);

  analyzer.addSamples(samples);
};
