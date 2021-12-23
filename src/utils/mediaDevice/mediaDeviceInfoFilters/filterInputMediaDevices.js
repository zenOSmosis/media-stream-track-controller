/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * input devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
module.exports = function filterInputMediaDevices(mediaDeviceInfoList) {
  return mediaDeviceInfoList.filter(device =>
    // TODO: Use constant
    device.kind.includes("input")
  );
};
