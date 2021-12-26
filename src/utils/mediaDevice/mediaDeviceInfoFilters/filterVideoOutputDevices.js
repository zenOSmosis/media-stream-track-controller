const filterOutputMediaDevices = require("./filterOutputMediaDevices");
const { GENERIC_VIDEO_DEVICE_KIND } = require("../../../constants");

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * video output devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo[] | Object[]}
 */
module.exports = function filterVideoOutputDevices(mediaDeviceInfoList) {
  return filterOutputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes(GENERIC_VIDEO_DEVICE_KIND)
  );
};
