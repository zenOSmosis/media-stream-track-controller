/**
 * Lists all input and output media devices.
 *
 * @param {boolean} isAggressive? [optional; default=true]
 * @return {Promise<MediaDeviceInfo[]>}
 */
const fetchMediaDevices = async (isAggressive = true) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.warn("enumerateDevices() not supported.");
    return [];
  }

  const fetchDevices = () => navigator.mediaDevices.enumerateDevices();

  let devices = await fetchDevices();

  // If not able to fetch label for all devices...
  if (isAggressive && devices.some(({ label }) => !label.length)) {
    // ... temporarily turn on microphone...
    const tempMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    //  ... and fetch again
    devices = await fetchDevices();

    // ... then turn off the mic
    tempMediaStream.getTracks().forEach(track => track.stop());
  }

  return devices;
};

/**
 * Returns a filtered array of MediaDeviceInfo[-like] structures, representing
 * input devices only.
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
 * @param {MediaDeviceInfo[] | Object[]} mediaDeviceInfoList
 * @return {MediaDeviceInfo | Object}
 */
const filterVideoOutputDevices = mediaDeviceInfoList => {
  return filterOutputMediaDevices(mediaDeviceInfoList).filter(device =>
    device.kind.includes("video")
  );
};

module.exports = fetchMediaDevices;

module.exports.filterInputMediaDevices = filterInputMediaDevices;
module.exports.filterAudioInputDevices = filterAudioInputDevices;
module.exports.filterVideoInputDevices = filterVideoInputDevices;

module.exports.filterOutputMediaDevices = filterOutputMediaDevices;
module.exports.filterAudioOutputDevices = filterAudioOutputDevices;
module.exports.filterVideoOutputDevices = filterVideoOutputDevices;
