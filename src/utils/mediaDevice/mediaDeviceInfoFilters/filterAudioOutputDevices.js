const filterOutputMediaDevices = require("./filterOutputMediaDevices");
const { GENERIC_AUDIO_DEVICE_KIND } = require("../../../constants");

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * audio output devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo[] | Object[]}
 */
module.exports = function filterAudioOutputDevices(mediaDeviceInfoList) {
  return filterOutputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes(GENERIC_AUDIO_DEVICE_KIND)
  );
};
