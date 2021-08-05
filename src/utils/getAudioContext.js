/**
 * Retrieves a new AudioContext instance.
 *
 * @return {AudioContext}
 */
const getNewAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioContext ? new AudioContext() : null;

  return audioCtx;
};

/**
 * Retrieves a memoized shared audio context, or creates a new one and memoizes
 * it for subsequent calls.
 *
 * @return {AudioContext}
 */
const getSharedAudioContext = (() => {
  // Use for caching
  const sharedAudioCtx = getNewAudioContext();

  /**
   * Retrieves the shared AudioContext instance, creating it if not already
   * created.
   *
   * @return {AudioContext}
   */
  return () => sharedAudioCtx;
})();

/**
 * Resolves once audio context is resumed, or if it is currently running.
 *
 * @param {AudioContext} audioCtx? [optional; default = null] If not specified,
 * a shared audio context is utilized instead.
 * @return {Promise<void>}
 */
const untilAudioContextResumed = async (audioCtx = null) => {
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

module.exports.getNewAudioContext = getNewAudioContext;
module.exports.getSharedAudioContext = getSharedAudioContext;
module.exports.untilAudioContextResumed = untilAudioContextResumed;
