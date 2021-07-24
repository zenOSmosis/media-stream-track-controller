// TODO: While not directly related, this thread might have some useful information regarding constraints to set regarding stereo audio
// @see https://bugs.chromium.org/p/webrtc/issues/detail?id=8133

const PhantomCore = require("phantom-core");

// TODO: Document
function mergeConstraints(defaultConstraints, userConstraints) {
  return PhantomCore.mergeOptions(defaultConstraints, userConstraints);
}

/**
 * @param {Object} userConstraints? [default = {}]
 * @return {Object}
 */
function createAudioConstraints(userConstraints = {}) {
  const DEFAULT_CONSTRAINTS = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    sampleRate: 48000,
    sampleSize: 16,
  };

  return mergeConstraints(DEFAULT_CONSTRAINTS, userConstraints);
}

/**
 * @param {Object} userConstraints? [default = {}]
 * @return {Object}
 */
function createVideoConstraints(userConstraints = {}) {
  const DEFAULT_CONSTRAINTS = {
    // TODO: Add
  };

  return mergeConstraints(DEFAULT_CONSTRAINTS, userConstraints);
}

/**
 * @param {Object} userConstraints? [default = {}]
 * @return {Object}
 */
function createScreenCaptureConstraints(userConstraints = {}) {
  DEFAULT_CONSTRAINTS = {
    // Audio capturing requires additional UI check in browsers which support it (Chromium based)
    audio: createAudioConstraints(
      createAudioConstraints(userConstraints && userConstraints.audio)
    ),

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

module.exports = {
  mergeConstraints,
  createAudioConstraints,
  createVideoConstraints,
  createScreenCaptureConstraints,
};
