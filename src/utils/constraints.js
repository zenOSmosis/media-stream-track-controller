// TODO: While not directly related, this thread might have some useful information regarding constraints to set regarding stereo audio
// @see https://bugs.chromium.org/p/webrtc/issues/detail?id=8133

const mergeConstraints = require("./mergeConstraints");
const {
  getAudioQualityPresetConstraints,
  AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY,
} = require("./audioQualityPresets");

// TODO: Move into "constants" file
const AUDIO_DEVICE_KIND = "audio";
const VIDEO_DEVICE_KIND = "video";

/**
 * Creates default audio constraints, opting for high-fidelity audio.
 *
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object} // TODO: Document return object
 */
function createDefaultAudioConstraints(userConstraints = {}) {
  const DEFAULT_AUDIO_CONSTRAINTS = getAudioQualityPresetConstraints(
    AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY
  );

  return mergeConstraints(DEFAULT_AUDIO_CONSTRAINTS, userConstraints);
}

/**
 * Creates default video constraints.
 *
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object} // TODO: Document return object
 */
function createDefaultVideoConstraints(userConstraints = {}) {
  const DEFAULT_VIDEO_CONSTRAINTS = {
    video: true,
  };

  return mergeConstraints(DEFAULT_VIDEO_CONSTRAINTS, userConstraints);
}

/**
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object} // TODO: Document return object
 */
function createScreenCaptureConstraints(userConstraints = {}) {
  const DEFAULT_CONSTRAINTS = {
    // NOTE: Audio capturing is typically only available in Chromium-based
    // browsers and typically only works for capturing audio in browser tabs.
    //
    // Windows can capture full system audio this way, and Mac can be made to
    // capture full system audio with a third party virtual audio device
    // driver.
    //
    // To enable audio capturing in Chromium-based browsers, the user typically
    // needs to enable it in the UI dialog presented when initiating the screen
    // capture, and is sometimes easy to miss.
    ...createDefaultAudioConstraints(userConstraints && userConstraints.audio),

    // NOTE: Video constraints add cursor capturing capability on top of
    // existing default video constraints, hence why mergeConstraints is used
    // in the createDefaultVideoConstraints argument.
    ...createDefaultVideoConstraints(
      mergeConstraints(
        {
          video: {
            cursor: "always",
          },
        },
        userConstraints && userConstraints.video
      )
    ),
  };

  return mergeConstraints(DEFAULT_CONSTRAINTS, userConstraints);
}

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

/**
 * Helper method for obtaining constraints to capture from a specific media
 * device.
 *
 * @param {MediaDeviceInfo} mediaDeviceInfo @see fetchMediaDevices
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object} // TODO: Document return object
 */
function getSpecificDeviceCaptureConstraints(
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
}

module.exports = {
  mergeConstraints,
  createDefaultAudioConstraints,
  createDefaultVideoConstraints,
  createScreenCaptureConstraints,
  getSpecificDeviceIdCaptureConstraints,
  getSpecificDeviceCaptureConstraints,
};
