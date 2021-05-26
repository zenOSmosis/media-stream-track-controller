const {
  mergeConstraints,
  createAudioConstraints,
  createVideoConstraints,
} = require("./constraints");

/**
 * @return {Promise<MediaStream>}
 */
function captureScreen(constraints = {}) {
  DEFAULT_CONSTRAINTS = {
    video: createVideoConstraints(constraints.video),

    // Audio capturing requires additional UI check in browsers which support it (Chromium based)
    audio: createAudioConstraints(constraints.audio),
  };

  return navigator.mediaDevices.getDisplayMedia(
    mergeConstraints(DEFAULT_CONSTRAINTS, constraints)
  );
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
