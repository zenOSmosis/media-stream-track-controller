const fetchMediaDevices = require("./fetchMediaDevices");
const filterInputMediaDevices = require("./mediaDeviceInfoFilters/filterInputMediaDevices");

/**
 * Lists all input media devices.
 *
 * IMPORTANT: Unlike the underlying call to
 * navigator.mediaDevices.enumerateDevices, this function will resolve the same
 * MediaDeviceInfo instances across subsequent calls (as long as isAggressive
 * is not changed between calls).
 *
 * @param {boolean} isAggressive? [optional; default=true] If true, temporarily
 * turn on devices in order to obtain label information.
 * @return {Promise<MediaDeviceInfo[]>}
 */
module.exports = async function fetchInputMediaDevices(isAggressive = true) {
  const mediaDevices = await fetchMediaDevices(isAggressive);

  return filterInputMediaDevices(mediaDevices);
};
