const {
  PhantomCollection,
  /** @export */
  EVT_UPDATE,
  /** @export */
  EVT_DESTROY,
  /** @export */ EVT_CHILD_INSTANCE_ADD,
  /** @export */ EVT_CHILD_INSTANCE_REMOVE,
} = require("phantom-core");

const MediaStreamTrackController = require("./_base/_MediaStreamTrackControllerBase");
const AudioMediaStreamTrackController = require("./audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("./video/VideoMediaStreamTrackController");
const {
  GENERIC_AUDIO_DEVICE_KIND,
  GENERIC_VIDEO_DEVICE_KIND,
} = require("./constants");

/**
 * Manages an arbitrary amount of MediaStreamTrackControllers, where mute states
 * are linked together.
 */
class MediaStreamTrackControllerCollection extends PhantomCollection {
  /**
   * @param {MediaStreamTrackController[]} initialMediaStreamTrackControllers? [default = []]
   * @param {Object} phantomCollectionOptions? [default = {}]
   */
  constructor(
    initialMediaStreamTrackControllers = [],
    phantomCollectionOptions = {}
  ) {
    super(initialMediaStreamTrackControllers, phantomCollectionOptions);

    // Experimental, direct MediaStream support
    //
    // FIXME: This probably should not be used for most use cases at this time,
    // individual track controllers should likely be used instead, if possible
    //
    // FIXME: Since this exposes addEventListener property, it could create a
    // potential memory-leak should bind to it with a listener; further
    // consideration should be implemented for this
    //
    // FIXME: If deciding to leave in here, make a common collection called
    // MediaStreamTrackCollection and base this class, plus
    // ...FactoryCollection on it
    this._outputMediaStream = new MediaStream(
      this.getChildren().map(trackController =>
        trackController.getOutputTrack()
      )
    );

    (() => {
      let prevChildren = this.getChildren();

      const _handleUpdate = () => {
        // Handle output media stream dynamic track add / removal
        (() => {
          const nextChildren = this.getChildren();
          const {
            added: addedTrackControllers,
            removed: removedTrackControllers,
          } = MediaStreamTrackControllerCollection.getChildrenDiff(
            prevChildren,
            nextChildren
          );

          addedTrackControllers.forEach(trackController => {
            const mediaStreamTrack = trackController.getOutputTrack();

            // FIXME: Is this necessary since the track is from a controller?
            if (!(mediaStreamTrack instanceof MediaStreamTrack)) {
              throw new TypeError("mediaStreamTrack is not a MediaStreamTrack");
            }

            this._outputMediaStream.addTrack(trackController.getOutputTrack());
          });

          removedTrackControllers.forEach(trackController => {
            const mediaStreamTrack = trackController.getOutputTrack();

            // NOTE: The MediaStreamTrack might not be available if the
            // controller was destructed prior to _handleUpdate being called
            if (mediaStreamTrack) {
              // FIXME: Is this necessary since the track is from a controller?
              if (!(mediaStreamTrack instanceof MediaStreamTrack)) {
                throw new TypeError(
                  "mediaStreamTrack is not a MediaStreamTrack"
                );
              }

              // FIXME: (jh) This does not appear to actually remove the track
              // from the MediaStream (tested in Chrome, Firefox and iOS 14)
              // workaround-082320212130
              this._outputMediaStream.removeTrack(mediaStreamTrack);
            }
          });
        })();

        // Mask mute handling w/ all children
        this._syncTrackControllersMuteState();
      };

      this.on(EVT_UPDATE, _handleUpdate);
      this.on(EVT_CHILD_INSTANCE_ADD, _handleUpdate);
      this.on(EVT_CHILD_INSTANCE_REMOVE, _handleUpdate);
    })();
  }

  /**
   * @return {MediaStream}
   */
  getOutputMediaStream() {
    return this._outputMediaStream;
  }

  /**
   * Adds a MediaStreamTrackController to the collection.
   *
   * @param {MediaStreamTrackController} mediaStreamTrackController
   * @return {void}
   */
  addChild(mediaStreamTrackController) {
    if (!(mediaStreamTrackController instanceof MediaStreamTrackController)) {
      throw new TypeError(
        "mediaStreamTrackController is not a MediaStreamTrackController"
      );
    }

    // FIXME: This needs some consideration before enabling; perhaps a separate
    // property should be added (i.e. "isExplicitlyMuted") which is set if the
    // user muted the collection themselves, and if so, apply that muting state
    // to subsequent newly added track controllers. NOTE: This was considered
    // after inclusion of _syncTrackControllersMuteState and is not a conflict
    // of interest.
    /*
    // If collection is already muted, apply muting to added track controllers
    if (this.getIsMuted()) {
      mediaStreamTrackController.setIsMuted(true);
    }
    */

    super.addChild(mediaStreamTrackController);

    this._isMuted = false;
  }

  /**
   * Adds a MediaStreamTrackController to the collection.
   *
   * @param {MediaStreamTrackController} mediaStreamTrackController
   * @return {void}
   */
  addTrackController(mediaStreamTrackController) {
    this.addChild(mediaStreamTrackController);
  }

  /**
   * Removes a MediaStreamTrackController from the collection.
   *
   * @param {MediaStreamTrackController} mediaStreamTrackController
   * @return {void}
   */
  removeTrackController(mediaStreamTrackController) {
    this.removeChild(mediaStreamTrackController);
  }

  /**
   * @return {MediaStreamTrackController[]}
   */
  getTrackControllers() {
    return this.getChildren();
  }

  /**
    @return {AudioMediaStreamTrackController[]}
  */
  getAudioTrackControllers() {
    return this.getTrackControllers().filter(
      controller => controller instanceof AudioMediaStreamTrackController
    );
  }

  /**
    @return {VideoMediaStreamTrackController[]}
  */
  getVideoTrackControllers() {
    return this.getTrackControllers().filter(
      controller => controller instanceof VideoMediaStreamTrackController
    );
  }

  /**
   * Retrieves an array of input device ids, not guaranteed to be unique, for
   * all of associated track controllers.
   *
   * @param {string | null} kind? [default = null] IMPORTANT: This helps with
   * controller lookups with device ids that may be set to "default," in which
   * case an unexpected kind could occur if running audio / video controllers
   * simultaneously within the same collection.
   * @return {string[]}
   */
  getInputDeviceIds(kind = null) {
    let _lookupTracksFunc = null;

    switch (kind) {
      case null:
        _lookupTracksFunc = "getTrackControllers";
        break;

      case GENERIC_AUDIO_DEVICE_KIND:
        _lookupTracksFunc = "getAudioTrackControllers";
        break;

      case GENERIC_VIDEO_DEVICE_KIND:
        _lookupTracksFunc = "getVideoTrackControllers";
        break;

      default:
        throw new ReferenceError(`Unreferenced kind "${kind}"`);
    }

    return this[_lookupTracksFunc]().map(controller =>
      controller.getInputDeviceId()
    );
  }

  /**
   * Checks the state of all of the associated track controllers and flips the
   * this._isMuted flag accordingly without calling EVT_UPDATE.
   *
   * This is internally called once each track controller is updated.
   *
   * Conditions:
   *  - If every track controller is muted, set the _isMuted flag to true
   *  - If some track controllers are not muted, set the _isMuted flag to false
   *  - Otherwise, don't change the flag
   *
   * @return {void}
   */
  _syncTrackControllersMuteState() {
    const trackControllers = this.getChildren();

    if (trackControllers.every(controller => controller.getIsMuted())) {
      // If every is muted...
      this._isMuted = true;
    } else if (trackControllers.some(controller => !controller.getIsMuted())) {
      // If some are not muted...
      this._isMuted = false;
    }
  }

  // FIXME: Use the following methods via mixin with
  // MediaStreamTrackController base, once support is added in PhantomCore
  // @link https://github.com/zenOSmosis/phantom-core/issues/44

  /**
   * @param {boolean} isMuted
   * @return {<Promise<void>}
   */
  async setIsMuted(isMuted) {
    // Mute the track controllers directly
    await Promise.all(
      this.getTrackControllers().map(controller =>
        controller.setIsMuted(isMuted)
      )
    );
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
    return this.setIsMuted(!this._isMuted);
  }

  /**
   * Alias for this.destroy().
   *
   * @return {Promise<void>}
   */
  async stop() {
    if (!this.UNSAFE_getIsDestroying()) {
      return this.destroy();
    }
  }
}

module.exports = MediaStreamTrackControllerCollection;

module.exports.EVT_UPDATE = EVT_UPDATE;
module.exports.EVT_DESTROY = EVT_DESTROY;

module.exports.EVT_CHILD_INSTANCE_ADD = EVT_CHILD_INSTANCE_ADD;
module.exports.EVT_CHILD_INSTANCE_REMOVE = EVT_CHILD_INSTANCE_REMOVE;
