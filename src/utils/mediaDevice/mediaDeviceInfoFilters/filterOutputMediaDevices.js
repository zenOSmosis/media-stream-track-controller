const { GENERIC_OUTPUT_DEVICE_KIND } = require("../../../constants");

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * output devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo[] | Object[]}
 */
module.exports = function filterOutputMediaDevices(mediaDeviceInfoList) {
  return mediaDeviceInfoList.filter(device =>
    device.kind.includes(GENERIC_OUTPUT_DEVICE_KIND)
  );
};
