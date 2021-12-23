/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * audio output devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
module.exports = function filterAudioOutputDevices(mediaDeviceInfoList) {
  return filterOutputMediaDevices(mediaDeviceInfoList).filter(device =>
    // TODO: Use constant
    device.kind.includes("audio")
  );
};
