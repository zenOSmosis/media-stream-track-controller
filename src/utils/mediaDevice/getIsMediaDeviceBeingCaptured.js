const getMediaDeviceTrackControllers = require("./getMediaDeviceTrackControllers");

/**
 * Determines if the given media device is being captured.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo
 * @return {boolean}
 */
module.exports = function getIsMediaDeviceBeingCaptured(mediaDeviceInfo) {
  return Boolean(getMediaDeviceTrackControllers(mediaDeviceInfo).length > 0);
};
