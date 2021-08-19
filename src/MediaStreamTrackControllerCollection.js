const { PhantomCollection } = require("phantom-core");
const MediaStreamTrackController = require("./_base/_MediaStreamTrackControllerBase");

class MediaStreamTrackControllerCollection extends PhantomCollection {
  constructor(initialMediaStreamTrackControllers = []) {
    super(initialMediaStreamTrackControllers);
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

    // TODO: Mask mute handling w/ all children
    // TODO: If a child unmutes, or if all childs mute, update muting detection accordingly
  }

  // TODO: Document
  addMediaStreamTrackController(mediaStreamTrackController) {
    this.addChild(mediaStreamTrackController);
  }

  // TODO: Document
  removeMediaStreamTrackController(mediaStreamTrackController) {
    this.removeChild(mediaStreamTrackController);
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
    const areAllControllersMuted = this._trackControllers.every(controller =>
      controller.getIsMuted()
    );

    if (areAllControllersMuted) {
      this._isMuted = true;
    } else {
      const areSomeControllersUnmuted = this._trackControllers.some(
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
