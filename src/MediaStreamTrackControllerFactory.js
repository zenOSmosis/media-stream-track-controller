const { logger } = require("phantom-core");
const MediaStreamTrackControllerCollection = require("./MediaStreamTrackControllerCollection");
const {
  /** @export */
  EVT_READY,
  /** @export */
  EVT_UPDATE,
  /** @export */
  EVT_DESTROY,
  /** @export */
  EVT_CHILD_INSTANCE_ADD,
  /** @export */
  EVT_CHILD_INSTANCE_REMOVE,
} = MediaStreamTrackControllerCollection;
const MediaStreamTrackController = require("./_base/_MediaStreamTrackControllerBase");
const createTrackControllersFromMediaStream = require("./utils/mediaStreamTrack/createTrackControllersFromMediaStream");

const _factoryInstances = {};

/**
 * Factory class which breaks down a given MediaStream into
 * Audio/VideoMediaStreamTrackController constituents and uses them as a
 * collection.
 *
 * Generally, a single factory is utilized for a single gUM call.
 *
 * IMPORTANT: When all associated track controllers are removed, the factory
 * will self-destruct.
 */
class MediaStreamTrackControllerFactory extends MediaStreamTrackControllerCollection {
  // TODO: Move to factory collection instead?
  /**
   * Retrieves currently active MediaStreamTrackController instances.
   *
   * @return {MediaStreamTrackController[]}
   */
  static getTrackControllerInstances() {
    return MediaStreamTrackController.getTrackControllerInstances();
  }

  /**
   * @return {MediaStreamTrackControllerFactory[]}
   */
  static getFactoryInstances() {
    return Object.values(_factoryInstances);
  }

  // TODO: Move to factory collection instead?
  /**
   * Retrieves the factory instances which include one or more track
   * controllers originating from the given input media device.
   *
   * @param {MediaDeviceInfo | Object} mediaDeviceInfo
   * @param {string | null} kind? [default = null] // TODO: Specify available kinds
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
   * @param {MediaStream} inputMediaStream
   * @param {Object} factoryOptions? // TODO: Document
   */
  constructor(inputMediaStream, factoryOptions = {}) {
    if (!(inputMediaStream instanceof MediaStream)) {
      throw new TypeError("inputMediaStream is not of MediaStream type");
    }

    const initialTrackControllers = createTrackControllersFromMediaStream(
      inputMediaStream,
      factoryOptions
    );

    super(initialTrackControllers, factoryOptions);

    _factoryInstances[this._uuid] = this;

    // Handle auto-destruct once track controllers have ended

    this.on(EVT_CHILD_INSTANCE_REMOVE, () => {
      if (!this.getChildren().length && !this.UNSAFE_getIsDestroying()) {
        this.destroy();
      }
    });

    // If no children are already present, self-destruct
    if (!this.getChildren().length && !this.UNSAFE_getIsDestroying()) {
      this.destroy();
    }
  }

  /**
   * TODO: Document destroyHandler
   * @return {Promise<void>}
   */
  async destroy(destroyHandler = () => null) {
    return super.destroy(async () => {
      await destroyHandler();

      delete _factoryInstances[this._uuid];

      // Destruct all children on shutdown
      await this.destroyAllChildren();
    });
  }
}

module.exports = MediaStreamTrackControllerFactory;

module.exports.EVT_READY = EVT_READY;
module.exports.EVT_UPDATE = EVT_UPDATE;
module.exports.EVT_DESTROY = EVT_DESTROY;

module.exports.EVT_CHILD_INSTANCE_ADD = EVT_CHILD_INSTANCE_ADD;
module.exports.EVT_CHILD_INSTANCE_REMOVE = EVT_CHILD_INSTANCE_REMOVE;
