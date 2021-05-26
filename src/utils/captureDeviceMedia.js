const { mergeConstraints } = require("./constraints");

/**
 * @param {Object} constraints? [default = {}]
 * @return {Promise<MediaStream>}
 */
function captureDeviceMedia(constraints = {}) {
  DEFAULT_CONSTRAINTS = {
    audio: true,
    video: false,
  };

  return navigator.mediaDevices.getUserMedia(
    mergeConstraints(DEFAULT_CONSTRAINTS, constraints)
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
module.exports.getIsDeviceMediaCaptureSupported = getIsDeviceMediaCaptureSupported;
