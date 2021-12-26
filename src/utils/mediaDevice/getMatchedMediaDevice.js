const { MEDIA_DEVICE_KINDS } = require("../../constants");

/**
 * Determines best-guess comparison of the given MediaDeviceInfo[-like] against
 * an array of MediaDeviceInfo[-like] objects.
 *
 * WHY: Multiple gUM calls will resolve new object instances, and this attempts
 * to abstract away those multiple calls while still targeting the relevant
 * device.
 *
 * @param {"audioinput" | "videoinput" | "audiooutput" | "videooutput"} kind
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo A regular Object may be
 * passed if unable to acquire original MediaDeviceInfo (i.e. from a serialized
 * cache, etc.)
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList An array of
 * MediaDeviceInfo[-like] objects to compare against.
 * @return {MediaDeviceInfo | Object | null}
 */
module.exports = function getMatchedMediaDevice(
  kind,
  mediaDeviceInfo,
  mediaDeviceInfoList
) {
  if (!MEDIA_DEVICE_KINDS.includes(kind)) {
    throw new ReferenceError(`Invalid kind "${kind}"`);
  }

  // TODO: Refactor handling to getIsMatchedMediaDevice

  // Compare w/ deviceId match
  if (mediaDeviceInfo.deviceId) {
    const matchedDevice = mediaDeviceInfoList.find(
      device =>
        kind === device.kind && mediaDeviceInfo.deviceId === device.deviceId
    );

    if (matchedDevice) {
      return matchedDevice;
    }
  }

  // NOTE: groupId is not currently being matched against because it may return
  // a different device within the same group

  // Resort to label checking (best-guess scenario)
  if (mediaDeviceInfo.label) {
    // Find first matched device based on label
    const matchedDevice = mediaDeviceInfoList.find(
      device => kind === device.kind && mediaDeviceInfo.label === device.label
    );

    if (matchedDevice) {
      return matchedDevice;
    }
  }

  // IMPORTANT: Don't return the first device in the list as a last resort
  // because it will likely be the wrong data and skew a lot of implementations
  // of this function
  return null;
};
