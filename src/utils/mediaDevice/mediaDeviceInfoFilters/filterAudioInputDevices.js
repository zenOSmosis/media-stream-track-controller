const filterInputMediaDevices = require("./filterInputMediaDevices");
const { GENERIC_AUDIO_DEVICE_KIND } = require("../../../constants");

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * audio input devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo[] | Object[]}
 */
module.exports = function filterAudioInputDevices(mediaDeviceInfoList) {
  return filterInputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes(GENERIC_AUDIO_DEVICE_KIND)
  );
};
