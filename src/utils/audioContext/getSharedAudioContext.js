const getNewAudioContext = require("./getNewAudioContext");

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

module.exports = getSharedAudioContext;
