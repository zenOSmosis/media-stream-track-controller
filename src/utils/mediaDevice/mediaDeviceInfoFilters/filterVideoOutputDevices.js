const filterOutputMediaDevices = require("./filterOutputMediaDevices");

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * video output devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
module.exports = function filterVideoOutputDevices(mediaDeviceInfoList) {
  return filterOutputMediaDevices(mediaDeviceInfoList).filter(device =>
    // TODO: Use constant
    device.kind.includes("video")
  );
};
