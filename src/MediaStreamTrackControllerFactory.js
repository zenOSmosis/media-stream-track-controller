const CommonBase = require("./_base/_CommonControllerAndFactoryBase");
const { EVT_READY, EVT_UPDATED, EVT_DESTROYED } = CommonBase;
const MediaStreamTrackController = require("./_base/_MediaStreamTrackControllerBase");
const AudioMediaStreamTrackController = require("./audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("./video/VideoMediaStreamTrackController");
const debounce = require("debounce");

// TODO: Use PhantomCollection instead?
const _factoryInstances = {};

/**
 * Factory class which breaks down a given MediaStream into
 * Audio/VideoMediaStreamTrackController constituents.
 */
class MediaStreamControllerFactory extends CommonBase {
  /**
   * Retrieves currently active track controllers with the given input device
   * ID.
   *
   * @param {DOMString} deviceId
   * @return {MediaStreamTrackController[]}
   */
  static getTrackControllersWithInputDeviceId(deviceId) {
    const controllers =
      MediaStreamTrackController.getMediaStreamTrackControllerInstances();

    return controllers.filter(
      controller => controller.getInputDeviceId() === deviceId
    );
  }

  /**
   * @return {MediaStreamControllerFactory[]}
   */
  static getFactoryInstances() {
    return Object.values(_factoryInstances);
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
   * @param {Object} factoryOptions?
   */
  constructor(inputMediaStream, factoryOptions = {}) {
    if (!(inputMediaStream instanceof MediaStream)) {
      throw new TypeError("inputMediaStream is not of MediaStream type");
    }

    const DEFAULT_FACTORY_OPTIONS = {
      // Async init
      isReady: false,
    };

    super(CommonBase.mergeOptions(DEFAULT_FACTORY_OPTIONS, factoryOptions));

    _factoryInstances[this._uuid] = this;

    this._trackControllers =
      MediaStreamControllerFactory.createTrackControllersFromMediaStream(
        inputMediaStream,
        factoryOptions
      );

    // Handle auto-destruct once track controllers have ended
    (() => {
      // The number of active track controllers
      let lenControllers = this._trackControllers.length;

      let lenInitControllers = 0;

      for (const controller of this._trackControllers) {
        controller.onceReady().then(() => {
          ++lenInitControllers;

          if (lenInitControllers === lenControllers) {
            super._init();
          }
        });

        // Propagate EVT_UPDATED from track controllers up to factory
        //
        // IMPORTANT! This is debounced due to the fact that multiple track
        // controllers may update at the same time
        const handleTrackUpdated = debounce(
          () => {
            // Potentially flip this._isMuted flag before calling EVT_UPDATED
            this._syncTrackControllersMuteState();

            // Propagate EVT_UPDATED event through factory
            this.emit(EVT_UPDATED);
          },
          0,
          // Run on tail end of debounce
          false
        );

        controller.on(EVT_UPDATED, handleTrackUpdated);

        controller.once(EVT_DESTROYED, () => {
          // Remove controller from factory controllers
          this._trackControllers = this._trackControllers.filter(
            test => !Object.is(test, controller)
          );

          // Emit EVT_UPDATED since we've updated the track controllers count
          this.emit(EVT_UPDATED);

          controller.off(EVT_UPDATED, handleTrackUpdated);

          // Decrease active track controller count
          --lenControllers;

          // Automatically destruct once there are no more active track
          // controllers
          if (lenControllers === 0) {
            this.destroy();
          }
        });
      }

      // Automatically destruct if there are no track controllers
      if (!this._trackControllers.length) {
        this.destroy();
      }
    })();

    // A MediaStream based on the output tracks of the associated track
    // controllers
    this._outputMediaStream = new MediaStream([
      ...this._trackControllers.map(controller =>
        controller.getOutputMediaStreamTrack()
      ),
    ]);
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

  /**
   * Mutes all associated track controllers.
   *
   * @param {boolean} isMuted
   * @return {void}
   */
  setIsMuted(isMuted) {
    this._trackControllers.forEach(controller =>
      controller.setIsMuted(isMuted)
    );

    return super.setIsMuted();
  }

  /**
    @return {AudioMediaStreamTrackController[] | VideoMediaStreamTrackController[]}
   */
  getTrackControllers() {
    return this._trackControllers;
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
   * IMPORTANT: This MediaStream should be considered "read-only" and if it
   * should be stopped by a programmatic interaction, either this factory
   * instance should be destructed or the relevant track controller.
   *
   * This MediaStream should automatically go into an ended state once this
   * factory has been destructed.
   *
   * @return {MediaStream}
   */
  getOutputMediaStream() {
    return this._outputMediaStream;
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
   * @return {Promise<void>}
   */
  async destroy() {
    delete _factoryInstances[this._uuid];

    // Auto-destruct audio / video controllers
    await Promise.all(
      this._trackControllers.map(controller => controller.destroy())
    );

    super.destroy();
  }
}

module.exports = MediaStreamControllerFactory;
module.exports.EVT_READY = EVT_READY;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
