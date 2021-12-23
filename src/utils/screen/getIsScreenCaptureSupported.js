/**
 * Determines if screen capture is supported in the browser.
 *
 * @return {boolean}
 */
module.exports = function getIsScreenCaptureSupported() {
  return (
    navigator &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function"
  );
};
