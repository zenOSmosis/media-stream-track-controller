// TODO: While not directly related, this thread might have some useful information regarding constraints to set regarding stereo audio
// @see https://bugs.chromium.org/p/webrtc/issues/detail?id=8133

const PhantomCore = require("phantom-core");

/**
 * Deep merges the given user constraints onto the default constraints, where
 * user constraints take precidence.
 *
 * @param {Object} defaultConstraints
 * @param {Object} userConstraints
 * @return {Object}
 */
function mergeConstraints(defaultConstraints, userConstraints) {
  return PhantomCore.mergeOptions(defaultConstraints, userConstraints);
}

/**
 * IMPORTANT: This DOES NOT EXPOSE the "audio" base object.
 *
 * @param {Object} userConstraints? [default = {}]
 * @return {Object}
 */
function createAudioConstraints(userConstraints = {}) {
  const DEFAULT_AUDIO_CONSTRAINTS = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    sampleRate: 48000,
    sampleSize: 16,
  };

  return mergeConstraints(DEFAULT_AUDIO_CONSTRAINTS, userConstraints);
}

/**
 * IMPORTANT: This DOES NOT EXPOSE the "video" base object.
 *
 * @param {Object} userConstraints? [default = {}]
 * @return {Object}
 */
function createVideoConstraints(userConstraints = {}) {
  const DEFAULT_VIDEO_CONSTRAINTS = {
    // TODO: Finish adding
  };

  return mergeConstraints(DEFAULT_VIDEO_CONSTRAINTS, userConstraints);
}

/**
 * @param {Object} userConstraints? [default = {}]
 * @return {Object}
 */
function createScreenCaptureConstraints(userConstraints = {}) {
  DEFAULT_CONSTRAINTS = {
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
    audio: createAudioConstraints(userConstraints && userConstraints.audio),

    // NOTE: Video constraints add cursor capturing capability on top of
    // existing default video constraints, hence why mergeConstraints is used
    // in the createVideoConstraints argument.
    video: createVideoConstraints(
      mergeConstraints(
        {
          cursor: "always",
        },
        userConstraints && userConstraints.video
      )
    ),
  };

  return mergeConstraints(DEFAULT_CONSTRAINTS, userConstraints);
}

/**
 * Helper method for obtaining constaints to capture from a specific media
 * device with a given device id and type.
 *
 * IMPORTANT: This DOES EXPOSE the "audio" or "video" base object.
 *
 * @param {string} deviceId
 * @param {"audio" | "video"} deviceType
 * @param {Object} userConstraints? [default = {}]
 * @return {Object}
 */
function getSpecificDeviceIdCaptureConstraints(
  deviceId,
  deviceType,
  userConstraints = {}
) {
  const AUDIO_DEVICE_TYPE = "audio";
  const VIDEO_DEVICE_TYPE = "video";

  if (deviceType !== AUDIO_DEVICE_TYPE && deviceType !== VIDEO_DEVICE_TYPE) {
    throw new TypeError("deviceType must be audio or video");
  }

  const OVERRIDE_CONSTRAINTS = {
    [deviceType]: {
      deviceId: {
        exact: deviceId,
      },
    },
    // Prevent device of alternate type from starting (especially prevents mic
    // from starting when wanting to only capture video)
    [deviceType === AUDIO_DEVICE_TYPE
      ? VIDEO_DEVICE_TYPE
      : AUDIO_DEVICE_TYPE]: false,
  };

  // Fix issue where passing null as userConstaints will throw error
  if (!userConstraints) {
    userConstraints = {};
  }

  // Normalize userConstaints to have deviceType first child object
  if (typeof userConstraints[deviceType] === "undefined") {
    // Shallow copy user constaints into prevUserConstraints
    const prevUserConstaints = { ...userConstraints };

    // Clear out old constaints off of root object
    userConstraints = {};

    // Add previous user constaints to the new first child
    userConstraints[deviceType] = {
      ...prevUserConstaints,
    };
  } else if (typeof userConstraints[deviceType] === "boolean") {
    if (userConstraints[deviceType] === false) {
      return {};
    }

    userConstraints = {};
  }

  return mergeConstraints(userConstraints, OVERRIDE_CONSTRAINTS);
}

/**
 * Helper method for obtaining constaints to capture from a specific media
 * device.
 *
 * IMPORTANT: This DOES EXPOSE the "audio" or "video" base object.
 *
 * @param {MediaDeviceInfo} mediaDeviceInfo @see fetchMediaDevices
 * @param {Object} userConstraints? [default = {}]
 * @return {Object}
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
    mediaDeviceInfo.kind === "audioinput" ? "audio" : "video",
    userConstraints
  );
}

module.exports = {
  mergeConstraints,
  createAudioConstraints,
  createVideoConstraints,
  createScreenCaptureConstraints,
  getSpecificDeviceIdCaptureConstraints,
  getSpecificDeviceCaptureConstraints,
};
