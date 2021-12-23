const MediaStreamTrackControllerBase = require("../../_base/_MediaStreamTrackControllerBase");

/**
 * Searches for, and destructs, all track controllers with the given
 * mediaDeviceInfo as the input device.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo
 * @throws {ReferenceError} Throws if deviceId is not obtainable from
 * mediaDeviceInfo.
 * @return {Promise<void>}
 */
module.exports = async function uncaptureSpecificMediaDevice(mediaDeviceInfo) {
  const { deviceId } = mediaDeviceInfo;

  if (!deviceId) {
    throw new ReferenceError("Could not obtain deviceId from mediaDeviceInfo");
  }

  // Look up all track controllers with this mediaDeviceInfo and stop them
  return Promise.all(
    MediaStreamTrackControllerBase.getMediaStreamTrackControllerInstances()
      .filter(controller => controller.getInputDeviceId() === deviceId)
      .map(controller => controller.destroy())
  );
};
