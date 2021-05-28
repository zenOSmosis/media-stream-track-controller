const MediaStreamTrackControllerFactory = require("../MediaStreamTrackControllerFactory");

const {
  mergeConstraints,
  createAudioConstraints,
  createVideoConstraints,
} = require("./constraints");

/**
 * @param {Object} constraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
async function captureScreen(constraints = {}, factoryOptions = {}) {
  DEFAULT_CONSTRAINTS = {
    video: createVideoConstraints(constraints && constraints.video),

    // Audio capturing requires additional UI check in browsers which support it (Chromium based)
    audio: createAudioConstraints(constraints && constraints.audio),
  };

  const mediaStream = await navigator.mediaDevices.getDisplayMedia(
    mergeConstraints(DEFAULT_CONSTRAINTS, constraints)
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
