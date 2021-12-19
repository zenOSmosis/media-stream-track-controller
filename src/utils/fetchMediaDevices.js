const { filterInputMediaDevices } = require("./mediaDeviceInfoFilters");

/**
 * Lists all input and output media devices.
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
const fetchMediaDevices = (() => {
  const cache = {
    lastIsAggressive: null,
    lastMediaDevices: [],
  };

  return async (isAggressive = true) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn("enumerateDevices() not supported.");
      return [];
    }

    const fetchDevices = () => navigator.mediaDevices.enumerateDevices();

    let devices = await fetchDevices();

    // TODO: Skip this step (or change internal constraints) if already capturing type
    // If not able to fetch label for all devices...
    // TODO: Document the !label.length thing... why was this needed?
    if (isAggressive && devices.some(({ label }) => !label.length)) {
      // ... temporarily turn on microphone...
      const tempMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,

        // TODO: Provide optional video aggressive labeling (i.e. video: true)
      });

      //  ... and fetch again
      devices = await fetchDevices();

      // ... then turn off the aggressively captured media devices
      tempMediaStream.getTracks().forEach(track => track.stop());
    }

    // If last run isAggressive is the same as the current, use the cacheDiff,
    // otherwise bust the cache and start over
    //
    // IMPORTANT: This Boolean coerce fixes an issue in Safari when wrapping
    // fetchMediaDevice where cached media devices were not being used
    // @see https://github.com/zenOSmosis/speaker.app/pull/80
    if (Boolean(cache.lastIsAggressive) === Boolean(isAggressive)) {
      devices = cacheDiffMediaDevices(cache.lastMediaDevices, devices);
    } else {
      // Bust the cache and start over

      // Set updated isAggressive
      cache.lastIsAggressive = isAggressive;

      // Reset device list
      cache.lastMediaDevices = [];
    }

    cache.lastMediaDevices = [...devices];

    return devices;
  };
})();

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
const fetchInputMediaDevices = async (isAggressive = true) => {
  const mediaDevices = await fetchMediaDevices(isAggressive);

  return filterInputMediaDevices(mediaDevices);
};

/**
 * Applies a differential cache to prev / next media devices to enable
 * subsequent calls to fetchMediaDevices to retrieve the same device info
 * during the session duration.
 *
 * @param {MediaDeviceInfo[] | Object[]} prevMediaDevices
 * @param {MediaDeviceInfo[] | Object[]} nextMediaDevices
 * @return {MediaDeviceInfo[] | Object[]}
 */
const cacheDiffMediaDevices = (prevMediaDevices, nextMediaDevices) => {
  /**
   * This will become what is written back to the mediaDevices state.
   *
   * This original value represents the current state of mediaDevices with
   * removed new devices filtered out.
   *
   * @type {MediaDeviceList[]}
   */
  const next = prevMediaDevices.filter(device =>
    Boolean(
      nextMediaDevices.find(predicate => {
        const isMatch =
          predicate.kind === device.kind &&
          predicate.deviceId === device.deviceId;

        return isMatch;
      })
    )
  );

  // Add new media devices to the next array
  nextMediaDevices.forEach(device => {
    const isPrevious = Boolean(
      prevMediaDevices.find(
        predicate =>
          predicate.kind === device.kind &&
          predicate.deviceId === device.deviceId
      )
    );

    if (!isPrevious) {
      next.push(device);
    }
  });

  return next;
};

module.exports = fetchMediaDevices;
module.exports.fetchInputMediaDevices = fetchInputMediaDevices;

module.exports.cacheDiffMediaDevices = cacheDiffMediaDevices;
