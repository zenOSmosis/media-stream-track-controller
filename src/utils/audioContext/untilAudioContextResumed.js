const getSharedAudioContext = require("./getSharedAudioContext");

/**
 * Resolves once audio context is resumed, or if it is currently running.
 *
 * @param {AudioContext} audioCtx? [optional; default = null] If not specified,
 * a shared audio context is utilized instead.
 * @return {Promise<void>}
 */
module.exports = async function untilAudioContextResumed(audioCtx = null) {
  if (!audioCtx) {
    audioCtx = getSharedAudioContext();
  }

  // Note: This is not documented in https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
  // Found this fix: https://github.com/Tonejs/Tone.js/issues/341#issuecomment-386725880
  const isRunning = audioCtx.state === "running";

  // Due to browsers' autoplay policy, the AudioContext is only active after
  // the user has interacted with your app, after which the Promise returned
  // here is resolved.
  if (!isRunning) {
    console.debug("Trying to resume audio context");

    await audioCtx.resume();

    console.debug("Audio context resumed");
  }
};
