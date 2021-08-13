/**
 * Lists all input and output media devices.
 *
 * IMPORTANT: Unlike the underlying call to
 * navigator.mediaDevices.enumerateDevices, this function will resolve the same
 * MediaDeviceInfo instances across subsequent calls (as long as isAggressive
 * is not changed between calls).
 *
 * @param {boolean} isAggressive? [optional; default=true]
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

    // If last run isAggressive is the same as the current, use the cacheDiff,
    //otherwise bust the cache and start over
    if (cache.lastIsAggressive === isAggressive) {
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

module.exports.cacheDiffMediaDevices = cacheDiffMediaDevices;

module.exports.filterInputMediaDevices = filterInputMediaDevices;
module.exports.filterAudioInputDevices = filterAudioInputDevices;
module.exports.filterVideoInputDevices = filterVideoInputDevices;

module.exports.filterOutputMediaDevices = filterOutputMediaDevices;
module.exports.filterAudioOutputDevices = filterAudioOutputDevices;
module.exports.filterVideoOutputDevices = filterVideoOutputDevices;
