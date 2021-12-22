const { deepMerge } = require("phantom-core");
const MediaStreamTrackControllerBase = require("../_base/_MediaStreamTrackControllerBase");
const { EVT_UPDATED, EVT_DESTROYED } = MediaStreamTrackControllerBase;
const { getSharedAudioContext } = require("../utils/getAudioContext");

// TODO: Add stereo panner
// https://stackoverflow.com/questions/5123844/change-left-right-balance-on-playing-audio-in-javascript?rq=1
//    - default pan set to 0 - center
//    - const stereoNode = new StereoPannerNode(audioContext, { pan: 0 });

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
      isAsync: true,
    };

    super(inputMediaStreamTrack, deepMerge(DEFAULT_OPTIONS, options));

    // TODO: Make dynamic w/ passed config
    this._audioCtx = getSharedAudioContext();

    // The gain level when unmuted
    this._unmutedGain = 1;

    (async () => {
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

  /**
   * @param {boolean} isMuted
   * @return {Promise<void>}
   */
  async setIsMuted(isMuted) {
    await this.setGain(isMuted ? 0 : this._unmutedGain, false);

    return super.setIsMuted(isMuted);
  }

  /**
   * NOTE: If the track controller is not ready, this request will defer until
   * it is ready.
   *
   * @param {number} gain A floating point number from 0 - 1.
   * @param {boolean} isSetUnmutedGain? [default = true] If true, sets the
   * value for the gain level to be resumed after unmuting.
   * @return {Promise<void>}
   */
  async setGain(gain, isSetUnmutedGain = true) {
    if (isSetUnmutedGain) {
      this._unmutedGain = gain;
    }

    // Defer request until track is ready
    if (!this._isReady) {
      await this.onceReady();

      return this.setGain(gain, isSetUnmutedGain);
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

  /**
   * IMPORTANT: This is only accurate if the input MediaStreamTrack is directly
   * linked (not copied) to a getUserMedia or getDisplayMedia call.
   *
   * @return {boolean}
   */
  getIsNoiseSuppressionEnabled() {
    return this.getSettings().noiseSuppression;
  }

  /**
   * Sets whether noise suppression filtering should be applied to the track.
   *
   * @param {boolean} isNoiseSuppressionEnabled
   * @return {Promise<void>}
   */
  async setIsNoiseSuppressionEnabled(isNoiseSuppressionEnabled) {
    await this._inputMediaStreamTrack.applyConstraints({
      noiseSuppression: isNoiseSuppressionEnabled,
    });

    // NOTE: Chrome <= 96.x(+?) has a bug which does not allow for constraint
    // updates and silently ignores the fact
    if (isNoiseSuppressionEnabled !== this.getIsAutoGainControlEnabled()) {
      throw new Error(
        "Could not successfully apply noiseSuppression update to currently running track"
      );
    }

    this.emit(EVT_UPDATED);
  }

  /**
   * IMPORTANT: This is only accurate if the input MediaStreamTrack is directly
   * linked (not copied) to a getUserMedia or getDisplayMedia call.
   *
   * @return {boolean}
   */
  getIsEchoCancellationEnabled() {
    return this.getSettings().echoCancellation;
  }

  /**
   * Sets whether echo cancellation filtering should be applied to the track.
   *
   * @param {boolean} isNoiseSuppressionEnabled
   * @return {Promise<void>}
   */
  async setIsEchoCancellationEnabled(isEchoCancellationEnabled) {
    await this._inputMediaStreamTrack.applyConstraints({
      echoCancellation: isEchoCancellationEnabled,
    });

    // NOTE: Chrome <= 96.x(+?) has a bug which does not allow for constraint
    // updates and silently ignores the fact
    if (isEchoCancellationEnabled !== this.getIsEchoCancellationEnabled()) {
      throw new Error(
        "Could not successfully apply echoCancellation update to currently running track"
      );
    }

    this.emit(EVT_UPDATED);
  }

  /**
   * IMPORTANT: This is only accurate if the input MediaStreamTrack is directly
   * linked (not copied) to a getUserMedia or getDisplayMedia call.
   *
   * @return {boolean}
   */
  getIsAutoGainControlEnabled() {
    return this.getSettings().autoGainControl;
  }

  /**
   * Sets whether auto gain control should be applied to the track.
   *
   * @param {boolean} isNoiseSuppressionEnabled
   * @return {Promise<void>}
   */
  async setIsAutoGainControlEnabled(isAutoGainControlEnabled) {
    await this._inputMediaStreamTrack.applyConstraints({
      autoGainControl: isAutoGainControlEnabled,
    });

    // NOTE: Chrome <= 96.x(+?) has a bug which does not allow for constraint
    // updates and silently ignores the fact
    if (isAutoGainControlEnabled !== this.getIsAutoGainControlEnabled()) {
      throw new Error(
        "Could not successfully apply autoGainControl update to currently running track"
      );
    }

    this.emit(EVT_UPDATED);
  }
}

module.exports = AudioMediaStreamTrackController;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
