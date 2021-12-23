/**
 * Determines if the browser is capable of capturing input from audio / video
 * devices.
 *
 * @return {boolean}
 */
module.exports = function getIsMediaDeviceCaptureSupported() {
  return (
    navigator &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
};
