const MediaStreamTrackControllerFactory = require("../MediaStreamTrackControllerFactory");

const { createScreenCaptureConstraints } = require("./constraints");

/**
 * @param {Object} constraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureScreen(constraints = {}, factoryOptions = {}) {
  const mediaStream = await navigator.mediaDevices.getDisplayMedia(
    createScreenCaptureConstraints(constraints)
  );

  return new MediaStreamTrackControllerFactory(mediaStream, factoryOptions);
}

/**
 * @return {boolean}
 */
function getIsScreenCaptureSupported() {
  return (
    navigator &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function"
  );
}

module.exports = captureScreen;
module.exports.getIsScreenCaptureSupported = getIsScreenCaptureSupported;
