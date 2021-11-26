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

  // Apply default audio / video constraints to normalized constraints
  const nextConstraints =
    kind === AUDIO_DEVICE_KIND
      ? createDefaultAudioConstraints(userConstraints, false)
      : createDefaultVideoConstraints(userConstraints, false);

  return nextConstraints;
}

/**
 * Creates default audio constraints, opting for high-fidelity audio.
 *
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @param {boolean} isPostNormalizing? [default = true] Whether or not the
 * constraints will be normalized after merging
 * @return {Object}
 */
function createDefaultAudioConstraints(
  userConstraints = {},
  isPostNormalizing = true
) {
  const DEFAULT_AUDIO_CONSTRAINTS = {
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      sampleSize: 16,
    },
  };

  const updatedConstraints = isPostNormalizing
    ? createNormalizedConstraintsOfKind(AUDIO_DEVICE_KIND, userConstraints)
    : userConstraints;

  return mergeConstraints(DEFAULT_AUDIO_CONSTRAINTS, updatedConstraints);
}

/**
 * Creates default video constraints.
 *
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @param {boolean} isPostNormalizing? [default = true] Whether or not the
 * constraints will be normalized after merging
 * @return {Object}
 */
function createDefaultVideoConstraints(
  userConstraints = {},
  isPostNormalizing = true
) {
  const DEFAULT_VIDEO_CONSTRAINTS = {
    // TODO: Finish adding
    video: {},
  };

  const updatedConstraints = isPostNormalizing
    ? createNormalizedConstraintsOfKind(VIDEO_DEVICE_KIND, userConstraints)
    : userConstraints;

  return mergeConstraints(DEFAULT_VIDEO_CONSTRAINTS, updatedConstraints);
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
    ...createDefaultAudioConstraints(userConstraints && userConstraints.audio),

    // NOTE: Video constraints add cursor capturing capability on top of
    // existing default video constraints, hence why mergeConstraints is used
    // in the createDefaultVideoConstraints argument.
    ...createDefaultVideoConstraints(
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
 * IMPORTANT: If the device id is not obtainable, it will use the default
 * device for the kind.
 *
 * @param {string} deviceId
 * @param {"audio" | "video"} deviceKind
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object}
 */
function getSpecificDeviceIdCaptureConstraints(
  deviceId,
  deviceKind,
  userConstraints = {}
) {
  if (deviceKind !== AUDIO_DEVICE_KIND && deviceKind !== VIDEO_DEVICE_KIND) {
    throw new TypeError("deviceKind must be audio or video");
  }

  const OVERRIDE_CONSTRAINTS = {
    [deviceKind]: {
      exact: deviceId || "default",
    },

    // Prevent device of alternate type from starting (especially prevents mic
    // from starting when wanting to only capture video)
    [deviceKind === AUDIO_DEVICE_KIND
      ? VIDEO_DEVICE_KIND
      : AUDIO_DEVICE_KIND]: false,
  };

  // Normalize userConstraints to have deviceKind first child object
  userConstraints = createNormalizedConstraintsOfKind(
    deviceKind,
    userConstraints
  );

  // Prevent device from being captured if {audio/video: false} is set
  if (userConstraints[deviceKind] === false) {
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
  createDefaultAudioConstraints,
  createDefaultVideoConstraints,
  createScreenCaptureConstraints,
  getSpecificDeviceIdCaptureConstraints,
  getSpecificDeviceCaptureConstraints,
};
