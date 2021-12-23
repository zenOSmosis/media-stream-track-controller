/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * output devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
module.exports = function filterOutputMediaDevices(mediaDeviceInfoList) {
  return mediaDeviceInfoList.filter(device =>
    // TODO: Use constant
    device.kind.includes("output")
  );
};
