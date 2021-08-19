const {
  PhantomCollection,
  /** @exports */
  EVT_UPDATED,
  /** @exports */
  EVT_DESTROYED,
} = require("phantom-core");
const {
  /** @exports */ EVT_CHILD_INSTANCE_ADDED,
  /** @exports */ EVT_CHILD_INSTANCE_REMOVED,
} = PhantomCollection;
const MediaStreamTrackController = require("./_base/_MediaStreamTrackControllerBase");
const AudioMediaStreamTrackController = require("./audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("./video/VideoMediaStreamTrackController");

// TODO: Add ability to acquire output MediaStream / MediaStreamTracks?

/**
 * Manages an arbitrary amount of MediaStreamTrackControllers, where mute states
 * are linked together.
 */
class MediaStreamTrackControllerCollection extends PhantomCollection {
  constructor(initialMediaStreamTrackControllers = []) {
    super(initialMediaStreamTrackControllers);

    this.bindChildEventName(EVT_UPDATED);

    // Mask mute handling w/ all children
    (() => {
      const _handleUpdate = () => this._syncTrackControllersMuteState();

      this.on(EVT_UPDATED, _handleUpdate);
      this.on(EVT_CHILD_INSTANCE_ADDED, _handleUpdate);
      this.on(EVT_CHILD_INSTANCE_REMOVED, _handleUpdate);
    })();
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
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMString
   *
   * @return {DOMString[]}
   */
  getInputDeviceIds() {
    return this.getTrackControllers().map(controller =>
      controller.getInputDeviceId()
    );
  }

  /**
   * Checks the state of all of the associated track controllers and flips the
   * this._isMuted flag accordingly without calling EVT_UPDATED.
   *
   * This is internally called once each track controller is updated.
   *
   * @return {void}
   */
  _syncTrackControllersMuteState() {
    const trackControllers = this.getChildren();

    const areAllControllersMuted = trackControllers.every(controller =>
      controller.getIsMuted()
    );

    if (areAllControllersMuted) {
      this._isMuted = true;
    } else {
      const areSomeControllersUnmuted = trackControllers.some(
        controller => !controller.getIsMuted()
      );

      if (areSomeControllersUnmuted) {
        this._isMuted = false;
      }
    }
  }

  // FIXME: Use the following functions via mixin with
  // MediaStreamTrackController base, once support is added in PhantomCore
  // @see https://github.com/zenOSmosis/phantom-core/issues/44

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
    return this.destroy();
  }
}

module.exports = MediaStreamTrackControllerCollection;

module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;

module.exports.EVT_CHILD_INSTANCE_ADDED = EVT_CHILD_INSTANCE_ADDED;
module.exports.EVT_CHILD_INSTANCE_REMOVED = EVT_CHILD_INSTANCE_REMOVED;
