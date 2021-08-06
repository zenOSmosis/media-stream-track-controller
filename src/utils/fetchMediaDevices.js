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
 * Retrieves media devices filtered to inputs.
 *
 * @param {boolean} isAggressive? [optional; default=true]
 * @return {Promise<MediaDeviceInfo[]>}
 */
const fetchInputMediaDevices = async (isAggressive = true) => {
  const inputMediaDevices = await fetchMediaDevices(isAggressive);

  return inputMediaDevices.filter(device => device.kind.includes("input"));
};

const fetchAudioInputMediaDevices = async (isAggressive = true) => {
  const inputMediaDevices = await fetchInputMediaDevices(isAggressive);

  return inputMediaDevices.filter(device => device.kind.includes("audio"));
};

const fetchVideoInputMediaDevices = async (isAggressive = true) => {
  const inputMediaDevices = await fetchInputMediaDevices(isAggressive);

  return inputMediaDevices.filter(device => device.kind.includes("video"));
};

/**
 * Retrieves media devices filtered to outputs.
 *
 * @param {boolean} isAggressive? [optional; default=true]
 * @return {Promise<MediaDeviceInfo[]>}
 */
const fetchOutputMediaDevices = async (isAggressive = true) => {
  const outputMediaDevices = await fetchMediaDevices(isAggressive);

  return outputMediaDevices.filter(device => device.kind.includes("output"));
};

const fetchAudioOutputMediaDevices = async (isAggressive = true) => {
  const outputMediaDevices = await fetchOutputMediaDevices(isAggressive);

  return outputMediaDevices.filter(device => device.kind.includes("audio"));
};

const fetchVideoOutputMediaDevices = async (isAggressive = true) => {
  const outputMediaDevices = await fetchOutputMediaDevices(isAggressive);

  return outputMediaDevices.filter(device => device.kind.includes("video"));
};

/**
 * Performs best-guess match of given audio input previousDeviceInfo against
 * the currently available audio input devices.
 *
 * A use case for this may be for determining a default audio device against an
 * Object which was populated from previously serialized data.
 *
 * @param {MediaDeviceInfo | Object} previousDeviceInfo A regular Object may be
 * passed if unable to acquire original MediaDeviceInfo (i.e. from a serialized
 * cache, etc.)
 * @param {boolean | Object} isAggressiveOrMockObject If boolean is given, it
 * will fetch the current audio input media devices; if an array is given, it
 * will use it for mock data.
 * @return {Promise<MediaDeviceInfo | Object | null>}
 */
const fetchMatchAudioInputMediaDevice = async (
  previousDeviceInfo,
  isAggressiveOrMockObject = true
) => {
  const inputMediaDevices =
    typeof isAggressiveOrMockObject === "boolean"
      ? await fetchAudioInputMediaDevices(isAggressive)
      : isAggressiveOrMockObject;

  if (previousDeviceInfo.deviceId) {
    const matchedDevice = inputMediaDevices.find(
      device => previousDeviceInfo.deviceId === device.deviceId
    );

    if (matchedDevice) {
      return matchedDevice;
    }
  }

  if (previousDeviceInfo.groupId) {
    const matchedDevice = inputMediaDevices.find(
      device => previousDeviceInfo.groupId === device.groupId
    );

    if (matchedDevice) {
      return matchedDevice;
    }
  }

  if (previousDeviceInfo.label) {
    // Find first matched device based on label
    const matchedDevice = inputMediaDevices.find(
      device => previousDeviceInfo.label === device.label
    );

    if (matchedDevice) {
      return matchedDevice;
    }
  }

  return null;
};

module.exports = fetchMediaDevices;

module.exports.fetchInputMediaDevices = fetchInputMediaDevices;
module.exports.fetchAudioInputMediaDevices = fetchAudioInputMediaDevices;
module.exports.fetchVideoInputMediaDevices = fetchVideoInputMediaDevices;

module.exports.fetchOutputMediaDevices = fetchOutputMediaDevices;
module.exports.fetchAudioOutputMediaDevices = fetchAudioOutputMediaDevices;
module.exports.fetchVideoOutputMediaDevices = fetchVideoOutputMediaDevices;

module.exports.fetchMatchAudioInputMediaDevice =
  fetchMatchAudioInputMediaDevice;
