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
   * Retrieves currently active MediaStreamTrackController instances.
   *
   * @return {MediaStreamTrackController[]}
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
    // TODO: Should this automatically be cloned, or is that resource wastage?
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

  // TODO: Document
  getKind() {
    return this._inputMediaStreamTrack.kind;
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
      deviceId: this.getInputDeviceId(),
    };
  }

  /**
   * Retrieves MediaDeviceInfo of the track controller, compared against given
   * array of MediaDeviceInfo descriptions.
   *
   * This is written like this because this controller does may not have direct
   * access to the known list of MediaDeviceInfo as obtained from the window
   * navigator, and it shouldn't aggressively try to obtain the list (i.e. start
   * a media device on its own to get the full labels).
   *
   * Other considerations include being able to match against remote lists.
   *
   * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
   * @return {MediaDeviceInfo | Object}
   */
  getInputMediaDeviceInfoFromList(mediaDeviceInfoList) {
    // FIXME: This require is included within the function body itself because
    // of a conflict when trying to use it in the outer-scope and trying to
    // instantiate the class.
    //
    // Fixes Uncaught TypeError: Class extends value #<Object> is not a
    // constructor or null
    const utils = require("../utils");
    const { getMatchedMediaDevice } = utils;

    const partialMediaDeviceInfo = this.getPartialMediaDeviceInfo();

    return getMatchedMediaDevice(
      this.getKind(),
      partialMediaDeviceInfo,
      mediaDeviceInfoList
    );
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
