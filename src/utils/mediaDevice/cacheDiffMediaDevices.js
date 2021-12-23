// TODO: Rename
/**
 * Applies a differential cache to prev / next media devices to enable
 * subsequent calls to fetchMediaDevices to retrieve the same device info
 * during the session duration.
 *
 * @param {MediaDeviceInfo[] | Object[]} prevMediaDevices
 * @param {MediaDeviceInfo[] | Object[]} nextMediaDevices
 * @return {MediaDeviceInfo[] | Object[]}
 */
module.exports = function cacheDiffMediaDevices(
  prevMediaDevices,
  nextMediaDevices
) {
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
