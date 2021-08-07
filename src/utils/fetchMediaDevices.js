const { logger } = require("phantom-core");

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

// TODO: Document
const fetchAudioInputDevices = async (isAggressive = true) => {
  const inputMediaDevices = await fetchInputMediaDevices(isAggressive);

  return inputMediaDevices.filter(device => device.kind.includes("audio"));
};

/**
 * Retrieves the total number of audio input devices.
 *
 * @param {boolean} isAggressive? [default = false] IMPORTANT: Unlike the other
 * functions in this file, this one defaults to non-aggressive mode because it
 * doesn't require the full detail of audio input devices to be present.
 * @return {Promise<number>}
 */
const fetchTotalAudioInputDevices = async (isAggressive = false) => {
  let totalAudioInputDevices = 0;

  try {
    const inputMediaDevices = await fetchAudioInputDevices(isAggressive);

    totalAudioInputDevices = inputMediaDevices.length;
  } catch (err) {
    logger.error(err);
  } finally {
    return totalAudioInputDevices;
  }
};

// TODO: Document
const fetchVideoInputDevices = async (isAggressive = true) => {
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

// TODO: Document
const fetchAudioOutputDevices = async (isAggressive = true) => {
  const outputMediaDevices = await fetchOutputMediaDevices(isAggressive);

  return outputMediaDevices.filter(device => device.kind.includes("audio"));
};

// TODO: Document
const fetchVideoOutputDevices = async (isAggressive = true) => {
  const outputMediaDevices = await fetchOutputMediaDevices(isAggressive);

  return outputMediaDevices.filter(device => device.kind.includes("video"));
};

module.exports = fetchMediaDevices;

module.exports.fetchInputMediaDevices = fetchInputMediaDevices;
module.exports.fetchAudioInputDevices = fetchAudioInputDevices;
module.exports.fetchTotalAudioInputDevices = fetchTotalAudioInputDevices;
module.exports.fetchVideoInputDevices = fetchVideoInputDevices;

module.exports.fetchOutputMediaDevices = fetchOutputMediaDevices;
module.exports.fetchAudioOutputDevices = fetchAudioOutputDevices;
module.exports.fetchVideoOutputDevices = fetchVideoOutputDevices;
