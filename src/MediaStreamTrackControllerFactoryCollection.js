const MediaStreamTrackControllerFactory = require("./MediaStreamTrackControllerFactory");
const { PhantomCollection } = require("phantom-core");
const {
  /** @exports */
  EVT_UPDATED,
  /** @exports */
  EVT_DESTROYED,

  /** @exports */
  EVT_CHILD_INSTANCE_ADDED,
  /** @exports */
  EVT_CHILD_INSTANCE_REMOVED,
} = PhantomCollection;

// TODO: Document
module.exports = class MediaStreamTrackControllerFactoryCollection extends (
  PhantomCollection
) {
  /**
   * Adds the MediaStreamTrackControllerFactory instance to the collection.
   *
   * @param {MediaStreamTrackControllerFactory} factory
   * @return {void}
   */
  addChild(factory) {
    if (!(factory instanceof MediaStreamTrackControllerFactory)) {
      throw new TypeError("factory is not a MediaStreamTrackControllerFactory");
    }

    return super.addChild(factory);
  }

  /**
   * Alias for this.addChild(factory).
   *
   * @param {MediaStreamTrackControllerFactory} factory
   * @return {void}
   */
  addTrackControllerFactory(factory) {
    return this.addChild(factory);
  }

  /**
   * Removes the given MediaStreamTrackControllerFactory instance from the
   * collection.
   *
   * @param {MediaStreamTrackControllerFactory} factory
   * @return {void}
   */
  removeTrackControllerFactory(factory) {
    return this.removeChild(factory);
  }

  /**
   * Retrieves the MediaStreamTrackControllerFactory children of the
   * collection.
   *
   * @return {MediaStreamTrackControllerFactory[]}
   */
  getTrackControllerFactories() {
    return this.getChildren();
  }

  // TODO: Document
  getAudioTrackControllers() {
    return this.getChildren()
      .map(factory => factory.getAudioTrackControllers())
      .flat();
  }

  /**
   * // TODO: Document
   *
   * @param {boolean} isAudioMuted
   * @return {Promise<void>}
   */
  async setIsAudioMuted(isAudioMuted) {
    const audioTrackControllers = this.getAudioTrackControllers();

    await Promise.all(
      audioTrackControllers.map(controller =>
        controller.setIsMuted(isAudioMuted)
      )
    );
  }

  /**
   * Mutes the audio of the current MediaStreamTrackControllerFactory
   * children.
   *
   * NOTE: Factory instances added after muting will not be muted by default.
   *
   * @return {Promise<void>}
   */
  async muteAudio() {
    return this.setIsAudioMuted(true);
  }

  /**
   * Unmutes the audio of the current MediaStreamTrackControllerFactory
   * children.
   *
   * @return {Promise<void>}
   */
  unmuteAudio() {
    return this.setIsAudioMuted(false);
  }

  // TODO: Document
  getIsAudioMuted() {
    const audioTrackControllers = this.getAudioTrackControllers();

    return (
      !audioTrackControllers.length ||
      audioTrackControllers.every(controller => controller.getIsMuted())
    );
  }

  // TODO: Document
  getVideoTrackControllers() {
    return this.getChildren()
      .map(factory => factory.getVideoTrackControllers())
      .flat();
  }
};

module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;

module.exports.EVT_CHILD_INSTANCE_ADDED = EVT_CHILD_INSTANCE_ADDED;
module.exports.EVT_CHILD_INSTANCE_REMOVED = EVT_CHILD_INSTANCE_REMOVED;
