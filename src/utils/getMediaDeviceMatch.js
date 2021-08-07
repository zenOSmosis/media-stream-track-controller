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
 * @param {MediaDeviceInfo[] | Object[]} currentDevices The current list of
 * audio input devices.
 * @return {MediaDeviceInfo | Object | null}
 */
const getAudioCaptureDeviceMatch = (previousDeviceInfo, currentDevices) => {
  if (previousDeviceInfo.deviceId) {
    const matchedDevice = currentDevices.find(
      device => previousDeviceInfo.deviceId === device.deviceId
    );

    if (matchedDevice) {
      return matchedDevice;
    }
  }

  if (previousDeviceInfo.groupId) {
    const matchedDevice = currentDevices.find(
      device => previousDeviceInfo.groupId === device.groupId
    );

    if (matchedDevice) {
      return matchedDevice;
    }
  }

  if (previousDeviceInfo.label) {
    // Find first matched device based on label
    const matchedDevice = currentDevices.find(
      device => previousDeviceInfo.label === device.label
    );

    if (matchedDevice) {
      return matchedDevice;
    }
  }

  return null;
};

// NOTE: This is left as a non-default export because other methods may follow,
// one of which may match the filename
module.exports = {
  getAudioCaptureDeviceMatch,
};
