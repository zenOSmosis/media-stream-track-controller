const MediaStreamTrackControllerFactory = require("../MediaStreamTrackControllerFactory");

const { createScreenCaptureConstraints } = require("./constraints");

/**
 * Capture screen  content and resolve a controller factory to manage the media
 * track(s).
 *
 * For additional reading, @see https://w3c.github.io/mediacapture-main.
 *
 * @param {MediaTrackConstraints} userConstraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureScreen(userConstraints = {}, factoryOptions = {}) {
  const mediaStream = await navigator.mediaDevices.getDisplayMedia(
    createScreenCaptureConstraints(userConstraints)
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
