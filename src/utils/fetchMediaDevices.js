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
const fetchMediaCaptureDevices = async (isAggressive = true) => {
  const inputMediaDevices = await fetchMediaDevices(isAggressive);

  return inputMediaDevices.filter(device => device.kind.includes("input"));
};

/**
 * Retrieves all audio input devices.
 *
 * @param {boolean} isAggressive? [optional; default=true]
 * @return {Promise<MediaDeviceInfo[]>}
 */
const fetchAudioCaptureDevices = async (isAggressive = true) => {
  const inputMediaDevices = await fetchMediaCaptureDevices(isAggressive);

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
const fetchTotalAudioCaptureDevices = async (isAggressive = false) => {
  let totalAudioCaptureDevices = 0;

  try {
    const inputMediaDevices = await fetchAudioCaptureDevices(isAggressive);

    totalAudioCaptureDevices = inputMediaDevices.length;
  } catch (err) {
    logger.error(err);
  } finally {
    return totalAudioCaptureDevices;
  }
};

/**
 * Retrieves all video input devices.
 *
 * @param {boolean} isAggressive? [optional; default=true]
 * @return {Promise<MediaDeviceInfo[]>}
 */
const fetchVideoCaptureDevices = async (isAggressive = true) => {
  const inputMediaDevices = await fetchMediaCaptureDevices(isAggressive);

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

/**
 * Retrieves all audio output devices.
 *
 * @param {boolean} isAggressive? [optional; default=true]
 * @return {Promise<MediaDeviceInfo[]>}
 */
const fetchAudioOutputDevices = async (isAggressive = true) => {
  const outputMediaDevices = await fetchOutputMediaDevices(isAggressive);

  return outputMediaDevices.filter(device => device.kind.includes("audio"));
};

/**
 * Retrieves video output devices.
 *
 * NOTE: Depending on the configuration of the device and the attached
 * peripherals the video output devices may return empty, or not be the full
 * list of actual hardware devices.
 *
 * @param {boolean} isAggressive? [optional; default=true]
 * @return {Promise<MediaDeviceInfo[]>}
 */
const fetchVideoOutputDevices = async (isAggressive = true) => {
  const outputMediaDevices = await fetchOutputMediaDevices(isAggressive);

  return outputMediaDevices.filter(device => device.kind.includes("video"));
};

module.exports = fetchMediaDevices;

module.exports.fetchMediaCaptureDevices = fetchMediaCaptureDevices;
module.exports.fetchAudioCaptureDevices = fetchAudioCaptureDevices;
module.exports.fetchTotalAudioCaptureDevices = fetchTotalAudioCaptureDevices;
module.exports.fetchVideoCaptureDevices = fetchVideoCaptureDevices;

module.exports.fetchOutputMediaDevices = fetchOutputMediaDevices;
module.exports.fetchAudioOutputDevices = fetchAudioOutputDevices;
module.exports.fetchVideoOutputDevices = fetchVideoOutputDevices;
