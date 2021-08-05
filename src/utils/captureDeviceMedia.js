const MediaStreamTrackControllerFactory = require("../MediaStreamTrackControllerFactory");
const {
  mergeConstraints,
  getSpecificDeviceCaptureConstraints,
} = require("./constraints");

/**
 * IMPORTANT: At this time, video is not captured by default.
 *
 * @param {Object} constraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureDeviceMedia(constraints = {}, factoryOptions = {}) {
  const DEFAULT_CONSTRAINTS = {
    audio: true,
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
 * @param {MediaDeviceInfo} mediaDeviceInfo The media device info of the device to capture. @see fetchMediaDevices
 * @param {Object} constraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureSpecificMediaDevice(
  mediaDeviceInfo,
  constraints = {},
  factoryOptions = {}
) {
  return captureDeviceMedia(
    getSpecificDeviceCaptureConstraints(mediaDeviceInfo, "audio", constraints),
    factoryOptions
  );
}

/**
 * @return {boolean}
 */
function getIsDeviceMediaCaptureSupported() {
  return (
    navigator &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

module.exports = captureDeviceMedia;
module.exports.captureSpecificMediaDevice = captureSpecificMediaDevice;
module.exports.getIsDeviceMediaCaptureSupported =
  getIsDeviceMediaCaptureSupported;
