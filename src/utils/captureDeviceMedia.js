const MediaStreamTrackControllerFactory = require("../MediaStreamTrackControllerFactory");
const { mergeConstraints } = require("./constraints");

/**
 * @param {Object} constraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureDeviceMedia(constraints = {}, factoryOptions = {}) {
  DEFAULT_CONSTRAINTS = {
    audio: true,
    video: false,
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(
    mergeConstraints(DEFAULT_CONSTRAINTS, constraints)
  );

  return new MediaStreamTrackControllerFactory(mediaStream, factoryOptions);
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
module.exports.getIsDeviceMediaCaptureSupported =
  getIsDeviceMediaCaptureSupported;
