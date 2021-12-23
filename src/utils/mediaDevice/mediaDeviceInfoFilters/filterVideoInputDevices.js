const filterInputMediaDevices = require("./filterInputMediaDevices");

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * video input devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
module.exports = function filterVideoInputDevices(mediaDeviceInfoList) {
  return filterInputMediaDevices(mediaDeviceInfoList).filter(device =>
    // TODO: Use constant
    device.kind.includes("video")
  );
};
