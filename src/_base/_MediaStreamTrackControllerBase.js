const { PhantomCore, EVT_UPDATED, EVT_DESTROYED } = require("phantom-core");
const stopMediaStreamTrack = require("../utils/mediaStreamTrack/stopMediaStreamTrack");

// FIXME: Use PhantomCollection instead?
const _instances = {};

// FIXME: Extend PhantomState and use _isTrackEnded, _isMuted properties as
// state?
/**
 * NOTE: Once a MediaStreamTrack is associated with a track controller, it
 * will be stopped when the controller is destructed.
 *
 * IMPORTANT: For most use cases, this class should not be utilized directly,
 * and instead should be utilized by the AudioMediaStreamTrackController and
 * VideoMediaStreamTrackController extension classes.
 */
class MediaStreamTrackControllerBase extends PhantomCore {
  /**
   * Retrieves currently active MediaStreamTrackController instances.
   *
   * @return {MediaStreamTrackController[]}
   */
  static getTrackControllerInstances() {
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
      MediaStreamTrackControllerBase.getTrackControllerInstances();

    return controllers.filter(controller =>
      Object.is(controller._inputMediaStreamTrack, mediaStreamTrack)
    );
  }

  /**
   * @param {MediaStreamTrack} inputMediaStreamTrack
   * @param {Object} phantomCoreOptions? [default = {}]
   */
  constructor(inputMediaStreamTrack, phantomCoreOptions = {}) {
    if (!(inputMediaStreamTrack instanceof MediaStreamTrack)) {
      throw new TypeError(
        "inputMediaStreamTrack is not of MediaStreamTrack type"
      );
    }

    super(phantomCoreOptions);

    _instances[this._uuid] = this;

    this._inputMediaStreamTrack = Object.seal(inputMediaStreamTrack);

    // TODO: Dynamically handle w/ passed option
    // IMPORTANT: Do not clone input track for the output track because it
    // makes it difficult for the controller to stop the underlying device when
    // destructed
    //
    // FIXME: (jh) The previous message may no longer be the case after
    // applying workaround fixes to track stopping, however I'm not yet
    // positive if cloning the track would bring any additional benefit and
    // haven't yet looked into this further
    this._outputMediaStreamTrack = Object.seal(inputMediaStreamTrack);

    this._isTrackEnded = false;

    this._isMuted = false;

    // Destroy instance once track ends
    (() => {
      // IMPORTANT: This setImmediate is utilized so that
      // _outputMediaStreamTrack can be overridden by extender's constructor
      setImmediate(() => {
        const _handleTrackEnded = () => {
          // This check is here to prevent an infinite loop resulting in
          // Maximum Callstack Error
          if (!this._isTrackEnded) {
            this._isTrackEnded = true;

            if (!this.getIsDestroying()) {
              this.destroy();
            }
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
   * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/kind
   *
   * @return {"audio" | "video"}
   */
  getKind() {
    return this._inputMediaStreamTrack.kind;
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
   * More information about supported properties can be found here:
   * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings
   *
   * @return {MediaTrackSettings}
   */
  getSettings() {
    return this._inputMediaStreamTrack.getSettings();
  }

  /**
   * Retrieves the input device ID, which is an origin-unique string
   * identifying the source of the track.
   *
   * @return {string}
   */
  getInputDeviceId() {
    const inputSettings = this.getSettings();

    if (inputSettings) {
      return inputSettings.deviceId;
    }
  }

  /**
   * Retrieves an object with a structure based on a subset of MediaDeviceInfo
   * used for potential device matching with utils.getMediaDeviceMatch().
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
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
    const getMatchedMediaDevice = require("../utils/mediaDevice/getMatchedMediaDevice");

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
   * TODO: Utilize destroyHandler?
   * @return {Promise<void>}
   */
  async destroy() {
    return super.destroy(() => {
      // Automatically stop input and output tracks
      stopMediaStreamTrack(this._inputMediaStreamTrack);
      stopMediaStreamTrack(this._outputMediaStreamTrack);

      delete _instances[this._uuid];
    });
  }
}

module.exports = MediaStreamTrackControllerBase;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
