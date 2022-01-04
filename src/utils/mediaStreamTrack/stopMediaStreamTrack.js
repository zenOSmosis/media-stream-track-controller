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
  mediaStreamTrack.dispatchEvent(new Event("ended"));

  /**
   * Workaround (08/19/2021) for Firefox not calling dispatchEvent on
   * MediaStreamTrack. Stop all track controllers with this input track.
   *
   * Update (01/04/2022): (jh) This workaround doesn't seem to ALWAYS be
   * needed, however it seems to fix an issue in Speaker.app where, in a call
   * between Firefox and Safari, stopping a screenshare from Safari would
   * sometimes leave a still frame in Firefox instead of stopping the video
   * track completely.  I'm not exactly sure if it is due to this "fix" but it
   * seems to be non-reproducible with this left in.
   */
  (() => {
    // NOTE: This require is utilized within the function body due to
    // stopMediaStreamTrack also being a dependency of MediaStreamTrackControllerBase
    const MediaStreamTrackControllerBase = require("../../_base/_MediaStreamTrackControllerBase");

    /**
     * The setImmediate call is utilized because this method is called within
     * the destructor method of MediaStreamTrackControllerBase and it would
     * cause an infinite loop, otherwise.
     *
     * Also, consideration was made to make stopMediaStreamTrack return a
     * promise instead, resolving after such controllers have been destructed,
     * however I didn't think that the function signature should be changed for
     * such a thing.  Maybe it should be a promise, but it's currently not one.
     */
    setImmediate(() => {
      MediaStreamTrackControllerBase.getTrackControllersWithTrack(
        mediaStreamTrack
      ).forEach(controller => {
        if (!controller.getIsDestroyed()) {
          controller.destroy();
        }
      });
    });
  })();
};
