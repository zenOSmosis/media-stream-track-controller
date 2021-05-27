const PhantomCore = require("phantom-core");
const MediaStreamTrackControllerBase = require("../_MediaStreamTrackControllerBase");
const { EVT_UPDATED, EVT_DESTROYED } = MediaStreamTrackControllerBase;
const {
  getSharedAudioContext,
  untilAudioContextResumed,
} = require("../utils/getAudioContext");

/**
 * Utilized for live-manipulation of audio MediaStreamTrack instances.
 */
class AudioMediaStreamTrackController extends MediaStreamTrackControllerBase {
  /**
   * @param {MediaStreamTrack} inputMediaStreamTrack
   * @param {Object} options? [default = {}]
   */
  constructor(inputMediaStreamTrack, options = {}) {
    if (inputMediaStreamTrack.kind !== "audio") {
      throw new TypeError("inputMediaStreamTrack is not of audio type");
    }

    const DEFAULT_OPTIONS = {
      isReady: false,
    };

    super(
      inputMediaStreamTrack,
      PhantomCore.mergeOptions(DEFAULT_OPTIONS, options)
    );

    // TODO: Make dynamic w/ passed config
    this._audioCtx = getSharedAudioContext();

    // The gain level when unmuted
    this._unmutedGain = 1;

    (async () => {
      await untilAudioContextResumed(this._audioCtx);

      this._src = this._audioCtx.createMediaStreamSource(
        new MediaStream([inputMediaStreamTrack])
      );

      this._dst = this._audioCtx.createMediaStreamDestination();
      this._gainNode = this._audioCtx.createGain();

      this._src.connect(this._gainNode);
      this._gainNode.connect(this._dst);

      this._outputMediaStream = this._dst.stream;
      this._outputMediaStreamTrack = this._outputMediaStream.getTracks()[0];

      await super._init();
    })();
  }

  // TODO: Add stereo panner
  // https://stackoverflow.com/questions/5123844/change-left-right-balance-on-playing-audio-in-javascript?rq=1
  //    - default pan set to 0 - center
  //    - const stereoNode = new StereoPannerNode(audioContext, { pan: 0 });

  /**
   * @param {boolean} isMuted
   */
  setIsMuted(isMuted) {
    this.setGain(isMuted ? 0 : this._unmutedGain, false);

    super.setIsMuted(isMuted);
  }

  /**
   * @param {number} gain A floating point number from 0 - 1.
   * @param {boolean} isSetUnmutedGain? [default = true] If true, sets the
   * value for the gain level to be resumed after unmuting.
   */
  setGain(gain, isSetUnmutedGain = true) {
    if (isSetUnmutedGain) {
      this._unmutedGain = gain;
    }

    if (!this._isReady) {
      throw new Error("AudioMediaStreamTrackController is not ready");
    }

    if (this._gainNode) {
      this._gainNode.gain.value = gain;
    }

    this.emit(EVT_UPDATED);
  }

  /**
   * A floating point number from 0 - 1.
   *
   * @return {number}
   */
  getGain() {
    if (!this._isReady) {
      throw new Error("AudioMediaStreamTrackController is not ready");
    }

    return this._gainNode && this._gainNode.gain && this._gainNode.gain.value;
  }
}

module.exports = AudioMediaStreamTrackController;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
