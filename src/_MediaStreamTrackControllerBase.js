const PhantomCore = require("phantom-core");
const { EVT_UPDATED, EVT_DESTROYED } = PhantomCore;

// TODO: Use PhantomCollection instead?
const _instances = {};

/**
 * IMPORTANT: This class should not be utilized directly, and instead should be
 * utilized by the AudioMediaStreamTrackController and
 * VideoMediaStreamTrackController extension classes.
 */
class MediaStreamTrackControllerBase extends PhantomCore {
  /**
   * @return {MediaStreamTrackControllerBase[]}
   */
  static getMediaStreamTrackControllerInstances() {
    return Object.values(_instances);
  }

  /**
   * @param {MediaStreamTrack} inputMediaStreamTrack
   * @param {Object} options?
   */
  constructor(inputMediaStreamTrack, options = {}) {
    if (!(inputMediaStreamTrack instanceof MediaStreamTrack)) {
      throw new TypeError(
        "inputMediaStreamTrack is not of MediaStreamTrack type"
      );
    }

    super(options);

    _instances[this._uuid] = this;

    this._isMuted = false;

    this._inputMediaStreamTrack = inputMediaStreamTrack;
    // TODO: Dynamically handle w/ passed option
    this._outputMediaStreamTrack = inputMediaStreamTrack;

    // Destroy instance once track ends
    (() => {
      // IMPORTANT: This timeout is set so that _outputMediaStreamTrack can be
      // overridden by extender's constructor.
      setTimeout(() => {
        const _handleTrackEnded = () => this.destroy();

        this._inputMediaStreamTrack.addEventListener(
          "ended",
          _handleTrackEnded
        );
        this._outputMediaStreamTrack.addEventListener(
          "ended",
          _handleTrackEnded
        );

        this.once(EVT_DESTROYED, () => {
          this._inputMediaStreamTrack.removeEventListener(
            "ended",
            _handleTrackEnded
          );
          this._outputMediaStreamTrack.removeEventListener(
            "ended",
            _handleTrackEnded
          );
        });
      });
    })();
  }

  /**
   * Alias for this.destroy().
   *
   * @return {Promise<void>}
   */
  async stop() {
    return this.destroy();
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    // Automatically stop input and output tracks
    this._inputMediaStreamTrack.stop();
    this._outputMediaStreamTrack.stop();

    delete _instances[this._uuid];

    super.destroy();
  }

  setIsMuted(isMuted) {
    this._isMuted = isMuted;

    this.emit(EVT_UPDATED);
  }

  mute() {
    this.setIsMuted(true);
  }

  unmute() {
    this.setIsMuted(false);
  }

  /**
   * Sets muting state to alternate state.
   */
  toggleMute() {
    this.setIsMuted(!this._isMuted);
  }

  /**
   * @return {boolean}
   */
  getIsMuted() {
    return this._isMuted;
  }

  /**
   * @return {MediaStreamTrack}
   */
  getOutputMediaStreamTrack() {
    return this._outputMediaStreamTrack;
  }

  /**
   * Alias of this.getOutputMediaStreamTrack().
   *
   * @return {MediaStreamTrack}
   */
  getOutputTrack() {
    return this._outputMediaStreamTrack;
  }

  /**
   * @return {"audio" | "video"}
   */
  getTrackKind() {
    return this._outputMediaStreamTrack.kind;
  }
}

module.exports = MediaStreamTrackControllerBase;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
