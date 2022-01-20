const PhantomCore = require("phantom-core");

const _instances = {};

// TODO: Borrow algorithms from: https://github.com/zenOSmosis/js-shell/blob/master/frontend/src/process/ClientAudioWorkerProcess/ClientAudioWorkerProcess.js

class AudioAnalyzerWorker extends PhantomCore {
  constructor(nativeUUID) {
    const cachedWorker = _instances[nativeUUID];

    if (cachedWorker) {
      return cachedWorker;
    }

    super();

    this._nativeUUID = nativeUUID;
  }

  // TODO: Refactor and document
  /**
   * @param {Uint8Array} samples
   */
  addSamples(samples) {
    const rms = this.rootMeanSquare(samples);
    const log2Rms = rms && Math.log2(rms);

    // Audio audioLevel ranges from 0 (silence) to 10 (loudest).
    // let newAudioLevel = Math.ceil(log2Rms); // Our version; shows quieter, emits more often
    // let newAudioLevel = Math.ceil((10 * log2Rms) / 8); // Twilio version; shows louder

    // Constrain newAudioLevel between 0 - 10
    /*
    if (newAudioLevel < 0) {
      newAudioLevel = 0;
    } else if (newAudioLevel > 10) {
      newAudioLevel = 10;
    }
    */

    self.postMessage({ nativeUUID: this._nativeUUID, rms });
  }

  /**
   * @param {Uint8Array} samples
   * @return {number}
   */
  rootMeanSquare(samples) {
    const sumSq = samples.reduce((sumSq, sample) => sumSq + sample * sample, 0);
    return Math.sqrt(sumSq / samples.length);
  }
}

// TODO: Build accordingly

self.onmessage = function (evt) {
  const { uuid, samples } = evt.data;

  const analyzer = new AudioAnalyzerWorker(uuid);

  analyzer.addSamples(samples);
};
