const MediaStreamTrackControllerFactory = require("./MediaStreamTrackControllerFactory");
const {
  PhantomCollection /** @export */,
  EVT_UPDATE,
  /** @export */
  EVT_DESTROY,

  /** @export */
  EVT_CHILD_INSTANCE_ADD,
  /** @export */
  EVT_CHILD_INSTANCE_REMOVE,
} = require("phantom-core");

/**
 * Maintains a collection of MediaStreamTrackControllerFactory instances.
 */
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

  /**
   * Retrieves associated AudioMediaStreamTrackController instances for this
   * collection.
   *
   * FIXME: This Typedef doesn't seem to be working for comments
   * @typedef {import('./audio/AudioMediaStreamTrackController').default} AudioMediaStreamTrackController
   *
   * @return {AudioMediaStreamTrackController[]}
   */
  getAudioTrackControllers() {
    return this.getChildren()
      .map(factory => factory.getAudioTrackControllers())
      .flat();
  }

  /**
   * Set the audio mute state of the current MediaStreamTrackControllerFactory
   * children.
   *
   * NOTE: Factory instances added after muting will not be muted by default.
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

  /**
   * Retrieves whether or not all audio track controllers associated with this
   * collection are muted.
   *
   * @return {boolean}
   */
  getIsAudioMuted() {
    const audioTrackControllers = this.getAudioTrackControllers();

    return (
      !audioTrackControllers.length ||
      audioTrackControllers.every(controller => controller.getIsMuted())
    );
  }

  /**
   * Retrieves associated AudioMediaStreamTrackController instances for this
   * collection.
   *
   * FIXME: This Typedef doesn't seem to be working for comments
   * @typedef {import('./video/VideoMediaStreamTrackController').default} VideoMediaStreamTrackController
   *
   * @return {VideoMediaStreamTrackController[]}
   */
  getVideoTrackControllers() {
    return this.getChildren()
      .map(factory => factory.getVideoTrackControllers())
      .flat();
  }
};

module.exports.EVT_UPDATE = EVT_UPDATE;
module.exports.EVT_DESTROY = EVT_DESTROY;

module.exports.EVT_CHILD_INSTANCE_ADD = EVT_CHILD_INSTANCE_ADD;
module.exports.EVT_CHILD_INSTANCE_REMOVE = EVT_CHILD_INSTANCE_REMOVE;
