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
