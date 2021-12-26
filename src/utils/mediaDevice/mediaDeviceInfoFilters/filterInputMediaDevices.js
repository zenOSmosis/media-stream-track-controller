const { GENERIC_INPUT_DEVICE_KIND } = require("../../../constants");

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * input devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo[] | Object[]}
 */
module.exports = function filterInputMediaDevices(mediaDeviceInfoList) {
  return mediaDeviceInfoList.filter(device =>
    device.kind.includes(GENERIC_INPUT_DEVICE_KIND)
  );
};
