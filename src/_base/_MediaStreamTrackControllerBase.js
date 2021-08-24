const PhantomCore = require("phantom-core");
const { EVT_UPDATED, EVT_DESTROYED } = PhantomCore;

// TODO: Use PhantomCollection instead?
const _instances = {};

/**
 * IMPORTANT: This class should not be utilized directly, and instead should be
 * utilized by the AudioMediaStreamTrackController and
 * VideoMediaStreamTrackController extension classes.
 *
 * IMPORTANT: Once a MediaStreamTrack is associated with a track controller, it
 * will be stopped when the controller is destructed.
 */
class MediaStreamTrackControllerBase extends PhantomCore {
  /**
   * Retrieves currently active MediaStreamTrackController instances.
   *
   * @return {MediaStreamTrackController[]}
   */
  static getMediaStreamTrackControllerInstances() {
    return Object.values(_instances);
  }

  /**
   * Retrieves all track controllers with the given MediaStreamTrack.
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @return {MediaStreamTrackControllerBase[]}
   */
  static getTrackControllersWithTrack(mediaStreamTrack) {
    const controllers =
      MediaStreamTrackControllerBase.getMediaStreamTrackControllerInstances();

    return controllers.filter(controller =>
      Object.is(controller.UNSAFE_getInputMediaStreamTrack(), mediaStreamTrack)
    );
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

    this._inputMediaStreamTrack = Object.seal(inputMediaStreamTrack);

    // TODO: Dynamically handle w/ passed option
    // IMPORTANT: Do not clone input track for the output track because it
    // makes it difficult for the controller to stop the underlying device when
    // destructed
    this._outputMediaStreamTrack = Object.seal(inputMediaStreamTrack);

    this._isTrackEnded = false;

    this._isMuted = false;

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
   * Retrieves whether the associated input MediaStreamTrack is an audio or
   * video track.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/kind
   *
   * @return {"audio" | "video"}
   */
  getKind() {
    return this._inputMediaStreamTrack.kind;
  }

  /**
   * Retrieves the input MediaStreamTrack.
   *
   * IMPORTANT: For most class implementors this should not be at all.  It was
   * added here so we could do a static lookup of class instances with the
   * associated input MediaStreamTrack.
   *
   * @return {MediaStreamTrack}
   */
  UNSAFE_getInputMediaStreamTrack() {
    return this._inputMediaStreamTrack;
  }

  /**
   * Retrieves the output MediaStreamTrack.
   *
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
   * @return {string}
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
      `${this.getKind()}input`,
      partialMediaDeviceInfo,
      mediaDeviceInfoList
    );
  }

  /**
   * @param {boolean} isMuted
   * @return {Promise<void>}
   */
  async setIsMuted(isMuted) {
    this._isMuted = isMuted;

    this.emit(EVT_UPDATED);
  }

  /**
   * @return {boolean}
   */
  getIsMuted() {
    return this._isMuted;
  }

  /**
   * @return {Promise<void>}
   */
  async mute() {
    return this.setIsMuted(true);
  }

  /**
   * @return {Promise<void>}
   */
  async unmute() {
    return this.setIsMuted(false);
  }

  /**
   * Sets muting state to alternate state.
   *
   * @return {Promise<void>}
   */
  async toggleMute() {
    this.setIsMuted(!this._isMuted);
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

    // This is needed for any "ended" listeners, since we may be stopping the
    // track programmatically (instead of it ending on its own)
    //
    // NOTE: This MAY not be working with Firefox
    this._outputMediaStreamTrack.dispatchEvent(new Event("ended"));

    delete _instances[this._uuid];

    super.destroy();
  }
}

module.exports = MediaStreamTrackControllerBase;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
