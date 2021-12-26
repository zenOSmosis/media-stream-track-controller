const { MEDIA_DEVICE_KINDS } = require("../../constants");
const getIsSameMediaDevice = require("./getIsSameMediaDevice");

// TODO: Document why kind is used
/**
 * Determines best-guess comparison of the given MediaDeviceInfo[-like] against
 * an array of MediaDeviceInfo[-like] objects.
 *
 * WHY: Multiple gUM calls will resolve new object instances, and this attempts
 * to abstract away those multiple calls while still targeting the relevant
 * device.
 *
 * @param {"audioinput" | "videoinput" | "audiooutput" | "videooutput"} kind
 * @param {MediaDeviceInfo | Object} partialMediaDeviceInfo A regular Object may be
 * passed if unable to acquire original MediaDeviceInfo (i.e. from a serialized
 * cache, etc.)
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList An array of
 * MediaDeviceInfo[-like] objects to compare against.
 * @return {MediaDeviceInfo | Object | null}
 */
module.exports = function getMatchedMediaDevice(
  kind,
  partialMediaDeviceInfo,
  mediaDeviceInfoList
) {
  if (!MEDIA_DEVICE_KINDS.includes(kind)) {
    throw new ReferenceError(`Invalid kind "${kind}"`);
  }

  // IMPORTANT: Don't return the first device in the list as a last resort
  // because it will likely be the wrong data and skew a lot of implementations
  // of this function
  return mediaDeviceInfoList.find(pred =>
    getIsSameMediaDevice(partialMediaDeviceInfo, pred, kind)
  );
};
