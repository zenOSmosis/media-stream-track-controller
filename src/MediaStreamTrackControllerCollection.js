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

  // TODO: Document
  addChild(mediaStreamTrackController) {
    if (!(mediaStreamTrackController instanceof MediaStreamTrackController)) {
      throw new TypeError(
        "mediaStreamTrackController is not a MediaStreamTrackController"
      );
    }

    super.addChild(mediaStreamTrackController);

    this._isMuted = false;
  }

  // TODO: Document
  addMediaStreamTrackController(mediaStreamTrackController) {
    this.addChild(mediaStreamTrackController);
  }

  // TODO: Document
  removeMediaStreamTrackController(mediaStreamTrackController) {
    this.removeChild(mediaStreamTrackController);
  }

  // TODO: Document
  getMediaStreamTrackControllers() {
    return this.getChildren();
  }

  /**
   * Checks the state of all of the associated track controllers and flips the
   * this._isMuted flag accordingly without calling EVT_UPDATED.
   *
   * This is internally called once each track controller is updated.
   *
   * FIXME: This code was borrowed from MediaStreamTrackControllerFactory, and
   * perhaps a future refactor should use this collection within the factory
   * itself, with some rule differences.
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

  // FIXME: Use the following functions via mixin with _CommonControllerAndFactoryBase, once support is added in PhantomCore
  // @see https://github.com/zenOSmosis/phantom-core/issues/44

  /**
   * @param {boolean} isMuted
   * @return {void}
   */
  setIsMuted(isMuted) {
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
   * @return {void}
   */
  mute() {
    this.setIsMuted(true);
  }

  /**
   * @return {void}
   */
  unmute() {
    this.setIsMuted(false);
  }

  /**
   * Sets muting state to alternate state.
   *
   * @return {void}
   */
  toggleMute() {
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
}

module.exports = MediaStreamTrackControllerCollection;

module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;

module.exports.EVT_CHILD_INSTANCE_ADDED = EVT_CHILD_INSTANCE_ADDED;
module.exports.EVT_CHILD_INSTANCE_REMOVED = EVT_CHILD_INSTANCE_REMOVED;
