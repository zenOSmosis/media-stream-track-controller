const MediaStreamTrackControllerBase = require("../_base/_MediaStreamTrackControllerBase");
const MediaStreamTrackControllerFactory = require("../MediaStreamTrackControllerFactory");

const {
  mergeConstraints,
  getSpecificDeviceCaptureConstraints,
  createAudioConstraints,
} = require("./constraints");

/**
 * IMPORTANT: At this time, video is not captured by default.
 *
 * @param {MediaTrackConstraints} constraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureMediaDevice(constraints = {}, factoryOptions = {}) {
  const DEFAULT_CONSTRAINTS = {
    ...createAudioConstraints(constraints && constraints.audio),

    // FIXME: Implement video constraints if video will be captured by default
    // ...createVideoConstraints(constraints && constraints.video),
    video: false,
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(
    mergeConstraints(DEFAULT_CONSTRAINTS, constraints)
  );

  return new MediaStreamTrackControllerFactory(mediaStream, factoryOptions);
}

/**
 * Captures audio from the specific audio input device with the given
 * mediaDeviceId.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo The media device info of the device to capture. @see fetchMediaDevices
 * @param {MediaTrackConstraints} constraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureSpecificMediaDevice(
  mediaDeviceInfo,
  constraints = {},
  factoryOptions = {}
) {
  return captureMediaDevice(
    getSpecificDeviceCaptureConstraints(mediaDeviceInfo, "audio", constraints),
    factoryOptions
  );
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
module.exports.getIsMediaDeviceCaptureSupported =
  getIsMediaDeviceCaptureSupported;
module.exports.uncaptureSpecificMediaDevice = uncaptureSpecificMediaDevice;
