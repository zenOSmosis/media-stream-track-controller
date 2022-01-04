/**
 * Stops the given MediaStreamTrack.
 *
 * NOTE: As opposed to just calling track.stop() on the track itself, this
 * applies some workaround fixes to ensure that the track is properly managed
 * within the library.
 *
 * @param {MediaStreamTrack} mediaStreamTrack
 * @return {void}
 */
module.exports = function stopMediaStreamTrack(mediaStreamTrack) {
  mediaStreamTrack.stop();

  /**
   * Because ended is explicitly not fired when you call track.stop()
   * yourself. It only fires when a track ends for other reasons.
   *
   * From the spec:
   *
   * Fired when...
   * The MediaStreamTrack object's source will no longer provide any data,
   * either because the user revoked the permissions, or because the source
   * device has been ejected, or because the remote peer permanently stopped
   * sending data.
   *
   * @link https://stackoverflow.com/questions/55953038/why-is-the-ended-event-not-firing-for-this-mediastreamtrack
   */
  // FIXME: (jh) I don't recall the original conditions where this was
  // warranted; if able to reproduce why this fix was needed, it should be
  // documented
  mediaStreamTrack.dispatchEvent(new Event("ended"));
};
