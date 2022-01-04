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
  // TODO: Document
  addChild(factory) {
    if (!(factory instanceof MediaStreamTrackControllerFactory)) {
      throw new TypeError("factory is not a MediaStreamTrackControllerFactory");
    }

    return super.addChild(factory);
  }

  // TODO: Document
  addTrackControllerFactory(factory) {
    return this.addChild(factory);
  }

  // TODO: Document
  removeTrackControllerFactory(factory) {
    return this.removeChild(factory);
  }

  // TODO: Document
  getTrackControllerFactories() {
    return this.getChildren();
  }

  // TODO: Document
  getAudioTrackControllers() {
    return this.getChildren()
      .map(factory => factory.getAudioTrackControllers())
      .flat();
  }

  // TODO: Document
  setIsAudioMuted(isAudioMuted) {
    const audioTrackControllers = this.getAudioTrackControllers();

    audioTrackControllers.forEach(controller =>
      controller.setIsMuted(isAudioMuted)
    );
  }

  // TODO: Document
  muteAudio() {
    return this.setIsAudioMuted(true);
  }

  // TODO: Document
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
