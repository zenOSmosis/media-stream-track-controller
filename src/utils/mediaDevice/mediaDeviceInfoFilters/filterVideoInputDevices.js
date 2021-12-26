const filterInputMediaDevices = require("./filterInputMediaDevices");
const { GENERIC_VIDEO_DEVICE_KIND } = require("../../../constants");

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * video input devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo[] | Object[]}
 */
module.exports = function filterVideoInputDevices(mediaDeviceInfoList) {
  return filterInputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes(GENERIC_VIDEO_DEVICE_KIND)
  );
};
