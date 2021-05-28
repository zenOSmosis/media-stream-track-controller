const PhantomCore = require("phantom-core");
const { EVT_READY, EVT_UPDATED, EVT_DESTROYED } = PhantomCore;
const AudioMediaStreamTrackController = require("./audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("./video/VideoMediaStreamTrackController");

// TODO: Use PhantomCollection instead?
const _factoryInstances = {};

/**
 * Factory class which breaks down a given MediaStream into
 * Audio/VideoMediaStreamTrackController constituents.
 */
class MediaStreamControllerFactory extends PhantomCore {
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
   * @param {Object} options? [optional; default = {}] If set, options are
   * passed collectively to track controller constructors
   * @return {AudioMediaStreamTrackController[] | VideoMediaStreamTrackController[]}
   */
  static createTrackControllers(inputMediaStream, options = {}) {
    const controllers = [];

    for (const track of inputMediaStream.getTracks()) {
      switch (track.kind) {
        case "audio":
          controllers.push(new AudioMediaStreamTrackController(track, options));
          break;

        case "video":
          controllers.push(new VideoMediaStreamTrackController(track, options));
          break;

        default:
          throw new TypeError(`Unknown track kind: ${track.kind}`);
      }
    }

    return controllers;
  }

  /**
   * @param {MediaStream} inputMediaStream
   * @param {Object} options?
   */
  constructor(inputMediaStream, options = {}) {
    if (!(inputMediaStream instanceof MediaStream)) {
      throw new TypeError("inputMediaStream is not of MediaStream type");
    }

    const DEFAULT_OPTIONS = {
      isReady: false,
    };

    super(PhantomCore.mergeOptions(DEFAULT_OPTIONS, options));

    _factoryInstances[this._uuid] = this;

    this._trackControllers =
      MediaStreamControllerFactory.createTrackControllers(
        inputMediaStream,
        options
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

        const handleTrackUpdated = (...args) => {
          this.emit(EVT_UPDATED, ...args);
        };

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
    @return {AudioMediaStreamTrackController[] | VideoMediaStreamTrackController[]}
   */
  getTrackControllers() {
    return this._trackControllers;
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
   * Alias for this.destroy().
   *
   *
   * @return {Promise<void>}
   */
  async stop() {
    return this.destroy();
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
