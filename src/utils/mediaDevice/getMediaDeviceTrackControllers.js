const MediaStreamTrackControllerBase = require("../../_base/_MediaStreamTrackControllerBase");

/**
 * Retrieves the associated track controllers for the given media device.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo
 * @return {MediaStreamTrackControllerBase[]}
 */
module.exports = function getMediaDeviceTrackControllers(mediaDeviceInfo) {
  const { deviceId } = mediaDeviceInfo;

  if (!deviceId) {
    throw new ReferenceError("Could not obtain deviceId from mediaDeviceInfo");
  }

  return MediaStreamTrackControllerBase.getMediaStreamTrackControllerInstances().filter(
    controller => controller.getInputDeviceId() === deviceId
  );
};
