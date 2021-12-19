/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * input devices only.
 *
 * NOTE: This was implemented as a separate array filter function in order to
 * perform unit testing.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
const filterInputMediaDevices = mediaDeviceInfoList => {
  return mediaDeviceInfoList.filter(device => device.kind.includes("input"));
};

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * audio input devices only.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
const filterAudioInputDevices = mediaDeviceInfoList => {
  return filterInputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes("audio")
  );
};

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * video input devices only.
 *
 * NOTE: This was implemented as a separate array filter function in order to
 * perform unit testing.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
const filterVideoInputDevices = mediaDeviceInfoList => {
  return filterInputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes("video")
  );
};

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * output devices only.
 *
 * NOTE: This was implemented as a separate array filter function in order to
 * perform unit testing.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
const filterOutputMediaDevices = mediaDeviceInfoList => {
  return mediaDeviceInfoList.filter(device => device.kind.includes("output"));
};

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * audio output devices only.
 *
 * NOTE: This was implemented as a separate array filter function in order to
 * perform unit testing.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
const filterAudioOutputDevices = mediaDeviceInfoList => {
  return filterOutputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes("audio")
  );
};

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * video output devices only.
 *
 * NOTE: This was implemented as a separate array filter function in order to
 * perform unit testing.
 *
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
const filterVideoOutputDevices = mediaDeviceInfoList => {
  return filterOutputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes("video")
  );
};

module.exports.filterInputMediaDevices = filterInputMediaDevices;
module.exports.filterAudioInputDevices = filterAudioInputDevices;
module.exports.filterVideoInputDevices = filterVideoInputDevices;

module.exports.filterOutputMediaDevices = filterOutputMediaDevices;
module.exports.filterAudioOutputDevices = filterAudioOutputDevices;
module.exports.filterVideoOutputDevices = filterVideoOutputDevices;
