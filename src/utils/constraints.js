// TODO: While not directly related, this thread might have some useful information regarding constraints to set regarding stereo audio
// @see https://bugs.chromium.org/p/webrtc/issues/detail?id=8133

const PhantomCore = require("phantom-core");
const { deepMerge } = PhantomCore;

const AUDIO_DEVICE_KIND = "audio";
const VIDEO_DEVICE_KIND = "video";

/**
 * Deep merges the given user constraints onto the default constraints, where
 * user constraints take precedence.
 *
 * @param {MediaTrackConstraints} defaultConstraints
 * @param {MediaTrackConstraints} userConstraints
 * @return {Object}
 */
function mergeConstraints(defaultConstraints, userConstraints) {
  return deepMerge(defaultConstraints, userConstraints);
}

/**
 * Given the set of constraints of the given kind (audio or video), normalizes
 * the constraints with the kind as a sub-object and the constraints defined
 * within that sub-object, regardless if the sub-object was part of the
 * supplied constraints.
 *
 * @param {"audio" | "video"} kind
 * @param {Object | boolean} userConstraints
 * @return {Object}
 */
function createNormalizedConstraintsOfKind(kind, userConstraints = {}) {
  if (kind !== AUDIO_DEVICE_KIND && kind !== VIDEO_DEVICE_KIND) {
    throw new TypeError("kind must be either audio or video");
  }

  if (
    typeof userConstraints !== "object" &&
    typeof userConstraints !== "boolean"
  ) {
    throw new TypeError(
      `userConstraints must be either an object or a boolean; received "${typeof userConstraints}" type`
    );
  }

  // Implement direct boolean pass-thru w/ base sub-object
  if (typeof userConstraints === "boolean") {
    return {
      [kind]: userConstraints,
    };
  }

  // Allow userConstraints to be null
  if (userConstraints === null || userConstraints === undefined) {
    userConstraints = {};
  }

  if (userConstraints[kind] === undefined) {
    // Migrate existing user constraints to new object
    const prevUserConstraints = { ...userConstraints };

    userConstraints = {
      [kind]: prevUserConstraints,
    };
  } else if (userConstraints[kind][kind] !== undefined) {
    // Fix situations where doubled-up kind may be inadvertently passed via
    // userConstraints
    userConstraints[kind] = { ...userConstraints[kind][kind] };
  }

  return userConstraints;
}

/**
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object}
 */
function createAudioConstraints(userConstraints = {}) {
  const DEFAULT_AUDIO_CONSTRAINTS = {
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      sampleSize: 16,
    },
  };

  return mergeConstraints(
    DEFAULT_AUDIO_CONSTRAINTS,
    createNormalizedConstraintsOfKind(AUDIO_DEVICE_KIND, userConstraints)
  );
}

/**
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object}
 */
function createVideoConstraints(userConstraints = {}) {
  const DEFAULT_VIDEO_CONSTRAINTS = {
    // TODO: Finish adding
    video: {},
  };

  return mergeConstraints(
    DEFAULT_VIDEO_CONSTRAINTS,
    createNormalizedConstraintsOfKind(VIDEO_DEVICE_KIND, userConstraints)
  );
}

/**
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
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
    ...createAudioConstraints(userConstraints && userConstraints.audio),

    // NOTE: Video constraints add cursor capturing capability on top of
    // existing default video constraints, hence why mergeConstraints is used
    // in the createVideoConstraints argument.
    ...createVideoConstraints(
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
 * Helper method for obtaining constraints to capture from a specific media
 * device with a given device id and type.
 *
 * @param {string} deviceId
 * @param {"audio" | "video"} deviceType
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object}
 */
function getSpecificDeviceIdCaptureConstraints(
  deviceId,
  deviceType,
  userConstraints = {}
) {
  if (deviceType !== AUDIO_DEVICE_KIND && deviceType !== VIDEO_DEVICE_KIND) {
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
    [deviceType === AUDIO_DEVICE_KIND
      ? VIDEO_DEVICE_KIND
      : AUDIO_DEVICE_KIND]: false,
  };

  // Normalize userConstraints to have deviceType first child object
  userConstraints = createNormalizedConstraintsOfKind(
    deviceType,
    userConstraints
  );

  // Prevent device from being captured if {audio/video: false} is set
  if (userConstraints[deviceType] === false) {
    return {};
  }

  return mergeConstraints(userConstraints, OVERRIDE_CONSTRAINTS);
}

/**
 * Helper method for obtaining constraints to capture from a specific media
 * device.
 *
 * @param {MediaDeviceInfo} mediaDeviceInfo @see fetchMediaDevices
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
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
    mediaDeviceInfo.kind === "audioinput"
      ? AUDIO_DEVICE_KIND
      : VIDEO_DEVICE_KIND,
    userConstraints
  );
}

module.exports = {
  mergeConstraints,
  createNormalizedConstraintsOfKind,
  createAudioConstraints,
  createVideoConstraints,
  createScreenCaptureConstraints,
  getSpecificDeviceIdCaptureConstraints,
  getSpecificDeviceCaptureConstraints,
};
