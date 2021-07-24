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
