const CommonBase = require("./_CommonControllerAndFactoryBase");
const { EVT_UPDATED, EVT_DESTROYED } = CommonBase;

// TODO: Use PhantomCollection instead?
const _instances = {};

/**
 * IMPORTANT: This class should not be utilized directly, and instead should be
 * utilized by the AudioMediaStreamTrackController and
 * VideoMediaStreamTrackController extension classes.
 */
class MediaStreamTrackControllerBase extends CommonBase {
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

    this._inputMediaStreamTrack = inputMediaStreamTrack;

    // TODO: Dynamically handle w/ passed option
    this._outputMediaStreamTrack = inputMediaStreamTrack;

    this._isTrackEnded = false;

    // Destroy instance once track ends
    (() => {
      // IMPORTANT: This timeout is set so that _outputMediaStreamTrack can be
      // overridden by extender's constructor.
      setTimeout(() => {
        const _handleTrackEnded = () => {
          // This check is here to prevent an infinite loop resulting in
          // Maximum Callstack Error
          if (!this._isTrackEnded) {
            this._isTrackEnded = true;

            this.destroy();
          }
        };

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

  /**
   * Retrieves the settings related to the input MediaStreamTrack.
   *
   * @return {MediaTrackSettings}
   */
  getInputSettings() {
    return this._inputMediaStreamTrack.getSettings();
  }

  /**
   * Retrieves the settings related to the output MediaStreamTrack (does not
   * reflect the device the track is rendered on or listened to).
   *
   * @return {MediaTrackSettings}
   */
  getOutputSettings() {
    return this._outputMediaStreamTrack.getSettings();
  }

  /**
   * Retrieves the input device ID, which is an origin-unique string
   * identifying the source of the track.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMString
   *
   * @return {DOMString}
   */
  getInputDeviceId() {
    const inputSettings = this.getInputSettings();

    if (inputSettings) {
      return inputSettings.deviceId;
    }
  }

  /**
   * Retrieves an object with a structure based on a subset of MediaDeviceInfo
   * used for potential device matching with utils.getMediaDeviceMatch().
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
   *
   * @return {Object}
   */
  getPartialMediaDeviceInfo() {
    return {
      deviceId: this.getDeviceId(),
    };
  }

  /**
   * Determines if the given MediaDeviceInfo matches the input device of this
   * track controller.
   *
   * @param {MediaDeviceInfo | Object} mediaDeviceInfo
   * @return {boolean}
   */
  getIsMatchedInputMediaDeviceInfo(mediaDeviceInfo) {
    const { deviceId } = mediaDeviceInfo;

    return this.getInputDeviceId() === deviceId;
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    // Automatically stop input and output tracks
    this._inputMediaStreamTrack.stop();
    this._outputMediaStreamTrack.stop();

    // This is needed for any "ended" listeners, since we may be stopping the
    // track programmatically (instead of it ending on its own)
    this._outputMediaStreamTrack.dispatchEvent(new Event("ended"));

    delete _instances[this._uuid];

    super.destroy();
  }
}

module.exports = MediaStreamTrackControllerBase;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
