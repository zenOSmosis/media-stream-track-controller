// TODO: Rename to createNewAudioContext
/**
 * Retrieves a new AudioContext instance.
 *
 * NOTE: Subsequent calls to this will return a new AudioContext every time.
 * Most use cases might be better off calling getSharedAudioContext instead.
 *
 * @return {AudioContext | null}
 */
module.exports = function getNewAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioContext ? new AudioContext() : null;

  return audioCtx;
};
