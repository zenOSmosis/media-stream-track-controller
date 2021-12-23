/**
 * Determines if the user device / browser is capable / configured to support
 * media device capturing.
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
