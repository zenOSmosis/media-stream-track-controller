const mergeConstraints = require("./mergeConstraints");
const {
  GENERIC_AUDIO_DEVICE_KIND,
  GENERIC_VIDEO_DEVICE_KIND,
} = require("../../constants");
const { globalLogger } = require("phantom-core");

/**
 * Helper method for obtaining constraints to capture from a specific media
 * device.
 *
 * @param {MediaDeviceInfo} mediaDeviceInfo @see fetchMediaDevices
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object} // TODO: Document return object
 */
module.exports = function makeSpecificDeviceCaptureConstraints(
  mediaDeviceInfo,
  userConstraints = {}
) {
  if (!(mediaDeviceInfo instanceof MediaDeviceInfo)) {
    globalLoggerwarn(typeof mediaDeviceInfo);

    throw new TypeError("mediaDeviceInfo must be of MediaDeviceInfo type");
  }

  return makeSpecificDeviceIdCaptureConstraints(
    mediaDeviceInfo.deviceId,
    // TODO: Use constant here
    mediaDeviceInfo.kind === "audioinput"
      ? GENERIC_AUDIO_DEVICE_KIND
      : GENERIC_VIDEO_DEVICE_KIND,
    userConstraints
  );
};

/**
 * Helper method for obtaining constraints to capture from a specific media
 * device with a given device id and type.
 *
 * IMPORTANT: If the device id is not obtainable, it will use the default
 * device for the kind.
 *
 * @param {string} deviceId
 * @param {"audio" | "video"} deviceKind
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object} // TODO: Document return object
 */
function makeSpecificDeviceIdCaptureConstraints(
  deviceId,
  deviceKind,
  userConstraints = {}
) {
  if (
    deviceKind !== GENERIC_AUDIO_DEVICE_KIND &&
    deviceKind !== GENERIC_VIDEO_DEVICE_KIND
  ) {
    throw new TypeError("deviceKind must be audio or video");
  }

  // Prevent device from being captured if {audio/video: false} is set
  if (userConstraints && userConstraints[deviceKind] === false) {
    return {
      [deviceKind]: false,
    };
  }

  const OVERRIDE_CONSTRAINTS = {
    [deviceKind]: {
      deviceId: {
        exact: deviceId || "default",
      },
    },

    // Prevent device of alternate type from starting (especially prevents mic
    // from starting when wanting to only capture video)
    [deviceKind === GENERIC_AUDIO_DEVICE_KIND
      ? GENERIC_VIDEO_DEVICE_KIND
      : GENERIC_AUDIO_DEVICE_KIND]: false,
  };

  // IMPORTANT: OVERRIDE_CONSTRAINTS takes precedence here
  return mergeConstraints(userConstraints, OVERRIDE_CONSTRAINTS);
}

module.exports.makeSpecificDeviceIdCaptureConstraints =
  makeSpecificDeviceIdCaptureConstraints;
