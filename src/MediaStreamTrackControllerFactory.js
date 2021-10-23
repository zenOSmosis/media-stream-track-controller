const { logger, deepMerge } = require("phantom-core");
const MediaStreamTrackControllerCollection = require("./MediaStreamTrackControllerCollection");
const {
  /** @exports */
  EVT_READY,
  /** @exports */
  EVT_UPDATED,
  /** @exports */
  EVT_DESTROYED,
  /** @exports */
  EVT_CHILD_INSTANCE_ADDED,
  /** @exports */
  EVT_CHILD_INSTANCE_REMOVED,
} = MediaStreamTrackControllerCollection;
const MediaStreamTrackController = require("./_base/_MediaStreamTrackControllerBase");
const AudioMediaStreamTrackController = require("./audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("./video/VideoMediaStreamTrackController");

const _factoryInstances = {};

/**
 * Factory class which breaks down a given MediaStream into
 * Audio/VideoMediaStreamTrackController constituents and uses them as a
 * collection.
 *
 * IMPORTANT: When all associated track controllers are removed, the factory
 * will self-destruct.
 */
class MediaStreamTrackControllerFactory extends MediaStreamTrackControllerCollection {
  /**
   * Retrieves currently active MediaStreamTrackController instances.
   *
   * @return {MediaStreamTrackController[]}
   */
  static getMediaStreamTrackControllerInstances() {
    return MediaStreamTrackController.getMediaStreamTrackControllerInstances();
  }

  /**
   * @return {MediaStreamTrackControllerFactory[]}
   */
  static getFactoryInstances() {
    return Object.values(_factoryInstances);
  }

  /**
   * Retrieves the factory instances which include one or more track
   * controllers originating from the given input media device.
   *
   * @param {MediaDeviceInfo | Object} mediaDeviceInfo
   * @param {string | null} kind? [default = null]
   * @return {MediaStreamTrackControllerFactory[]}
   */
  static getFactoriesWithInputMediaDevice(mediaDeviceInfo, kind = null) {
    // Gracefully ignore mediaDeviceInfo not being present; just warn about it
    // and return an empty array
    if (!mediaDeviceInfo || !mediaDeviceInfo.deviceId) {
      logger.warn(
        "Unable to acquire associated factories for this media device because no mediaDeviceInfo is present"
      );

      return [];
    }

    const { deviceId } = mediaDeviceInfo;

    return MediaStreamTrackControllerFactory.getFactoryInstances().filter(
      factory => factory.getInputDeviceIds(kind).includes(deviceId)
    );
  }

  /**
   * Processes inputMediaStream, converting it into audio and video track
   * controllers.
   *
   * @param {MediaStream} inputMediaStream
   * @param {Object} factoryOptions? [optional; default = {}] If set, factoryOptions are
   * passed collectively to track controller constructors
   * @return {AudioMediaStreamTrackController[] | VideoMediaStreamTrackController[]}
   */
  static createTrackControllersFromMediaStream(
    inputMediaStream,
    factoryOptions = {}
  ) {
    const controllers = [];

    for (const track of inputMediaStream.getTracks()) {
      switch (track.kind) {
        case "audio":
          controllers.push(
            new AudioMediaStreamTrackController(track, factoryOptions)
          );
          break;

        case "video":
          controllers.push(
            new VideoMediaStreamTrackController(track, factoryOptions)
          );
          break;

        default:
          throw new TypeError(`Unknown track kind: ${track.kind}`);
      }
    }

    return controllers;
  }

  /**
   * @param {MediaStream} inputMediaStream
   * @param {Object} factoryOptions? // TODO: Document
   */
  constructor(inputMediaStream, factoryOptions = {}) {
    if (!(inputMediaStream instanceof MediaStream)) {
      throw new TypeError("inputMediaStream is not of MediaStream type");
    }

    const initialTrackControllers =
      MediaStreamTrackControllerFactory.createTrackControllersFromMediaStream(
        inputMediaStream,
        factoryOptions
      );

    super(initialTrackControllers, deepMerge(factoryOptions));

    _factoryInstances[this._uuid] = this;

    // Handle auto-destruct once track controllers have ended

    this.on(EVT_CHILD_INSTANCE_REMOVED, () => {
      if (!this.getChildren().length) {
        this.destroy();
      }
    });

    // If no children are already present, self-destruct
    if (!this.getChildren().length) {
      this.destroy();
    }
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    delete _factoryInstances[this._uuid];

    await this.destroyAllChildren();

    return super.destroy();
  }
}

module.exports = MediaStreamTrackControllerFactory;

module.exports.EVT_READY = EVT_READY;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;

module.exports.EVT_CHILD_INSTANCE_ADDED = EVT_CHILD_INSTANCE_ADDED;
module.exports.EVT_CHILD_INSTANCE_REMOVED = EVT_CHILD_INSTANCE_REMOVED;
