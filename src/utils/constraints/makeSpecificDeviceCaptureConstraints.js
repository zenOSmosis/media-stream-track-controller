const mergeConstraints = require("./mergeConstraints");

// TODO: Move into "constants" file
const AUDIO_DEVICE_KIND = "audio";
const VIDEO_DEVICE_KIND = "video";

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
    console.warn(typeof mediaDeviceInfo);

    throw new TypeError("mediaDeviceInfo must be of MediaDeviceInfo type");
  }

  return getSpecificDeviceIdCaptureConstraints(
    mediaDeviceInfo.deviceId,
    // TODO: Use constant here
    mediaDeviceInfo.kind === "audioinput"
      ? AUDIO_DEVICE_KIND
      : VIDEO_DEVICE_KIND,
    userConstraints
  );
};

// TODO: Rename to makeSpecificDeviceIdCaptureConstraints
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
function getSpecificDeviceIdCaptureConstraints(
  deviceId,
  deviceKind,
  userConstraints = {}
) {
  if (deviceKind !== AUDIO_DEVICE_KIND && deviceKind !== VIDEO_DEVICE_KIND) {
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
    [deviceKind === AUDIO_DEVICE_KIND
      ? VIDEO_DEVICE_KIND
      : AUDIO_DEVICE_KIND]: false,
  };

  // IMPORTANT: OVERRIDE_CONSTRAINTS takes precedence here
  return mergeConstraints(userConstraints, OVERRIDE_CONSTRAINTS);
}

module.exports.getSpecificDeviceIdCaptureConstraints =
  getSpecificDeviceIdCaptureConstraints;
