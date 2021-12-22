const MediaStreamTrackControllerBase = require("../_base/_MediaStreamTrackControllerBase");
const MediaStreamTrackControllerFactory = require("../MediaStreamTrackControllerFactory");

const {
  mergeConstraints,
  getSpecificDeviceCaptureConstraints,
  createDefaultAudioConstraints,
} = require("./constraints");

/**
 * Capture device media (gUM) and resolve a controller factory to manage the
 * media track(s).
 *
 * IMPORTANT: At this time, video is not captured by default but can be enabled
 * with constraints.
 *
 * For additional reading, @see https://w3c.github.io/mediacapture-main.
 *
 * @param {MediaTrackConstraints} userConstraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureMediaDevice(userConstraints = {}, factoryOptions = {}) {
  const DEFAULT_CONSTRAINTS = {
    ...createDefaultAudioConstraints(userConstraints && userConstraints.audio),

    // FIXME: Implement video constraints if video will be captured by default
    // ...createDefaultVideoConstraints(userConstraints && userConstraints.video),
    video: false,
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(
    mergeConstraints(DEFAULT_CONSTRAINTS, userConstraints)
  );

  return new MediaStreamTrackControllerFactory(mediaStream, factoryOptions);
}

/**
 * Captures audio from the specific audio input device with the given
 * mediaDeviceId.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo The media device info of the device to capture. @see fetchMediaDevices
 * @param {MediaTrackConstraints} userConstraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureSpecificMediaDevice(
  mediaDeviceInfo,
  userConstraints = {},
  factoryOptions = {}
) {
  const nextConstraints = getSpecificDeviceCaptureConstraints(
    mediaDeviceInfo,
    userConstraints
  );

  return captureMediaDevice(nextConstraints, factoryOptions);
}

/**
 * Searches for, and destructs, all track controllers with the given
 * mediaDeviceInfo as the input device.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo
 * @throws {ReferenceError} Throws if deviceId is not obtainable from
 * mediaDeviceInfo.
 * @return {Promise<void>}
 */
async function uncaptureSpecificMediaDevice(mediaDeviceInfo) {
  const { deviceId } = mediaDeviceInfo;

  if (!deviceId) {
    throw new ReferenceError("Could not obtain deviceId from mediaDeviceInfo");
  }

  // Look up all track controllers with this mediaDeviceInfo and stop them
  return Promise.all(
    MediaStreamTrackControllerBase.getMediaStreamTrackControllerInstances()
      .filter(controller => controller.getInputDeviceId() === deviceId)
      .map(controller => controller.destroy())
  );
}

/**
 * Retrieves the associated track controllers for the given media device.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo
 * @return {MediaStreamTrackControllerBase[]}
 */
function getMediaDeviceTrackControllers(mediaDeviceInfo) {
  const { deviceId } = mediaDeviceInfo;

  if (!deviceId) {
    throw new ReferenceError("Could not obtain deviceId from mediaDeviceInfo");
  }

  return MediaStreamTrackControllerBase.getMediaStreamTrackControllerInstances().filter(
    controller => controller.getInputDeviceId() === deviceId
  );
}

/**
 * Determines if the given media device is being captured.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo
 * @return {boolean}
 */
function getIsMediaDeviceBeingCaptured(mediaDeviceInfo) {
  return getMediaDeviceTrackControllers(mediaDeviceInfo).length > 0;
}

/**
 * Determines if the user device / browser is capable / configured to support
 * media device capturing.
 *
 * @return {boolean}
 */
function getIsMediaDeviceCaptureSupported() {
  return (
    navigator &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

module.exports = captureMediaDevice;
module.exports.captureSpecificMediaDevice = captureSpecificMediaDevice;
module.exports.uncaptureSpecificMediaDevice = uncaptureSpecificMediaDevice;
module.exports.getMediaDeviceTrackControllers = getMediaDeviceTrackControllers;
module.exports.getIsMediaDeviceBeingCaptured = getIsMediaDeviceBeingCaptured;
module.exports.getIsMediaDeviceCaptureSupported =
  getIsMediaDeviceCaptureSupported;
