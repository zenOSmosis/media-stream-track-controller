const MediaStreamTrackControllerBase = require("../_base/_MediaStreamTrackControllerBase");

/**
 * Stops all of the tracks of the given MediaStream, then removes them from the
 * stream.
 *
 * @param {MediaStream} mediaStream
 * @return {void}
 */
function stopMediaStream(mediaStream) {
  mediaStream.getTracks().forEach(track => {
    track.stop();

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
     * @see https://stackoverflow.com/questions/55953038/why-is-the-ended-event-not-firing-for-this-mediastreamtrack
     */
    track.dispatchEvent(new Event("ended"));

    /**
     * Workaround (08/19/2021) for Firefox not calling dispatchEvent on
     * MediaStreamTrack. Stop all track controllers with this input track.
     */
    MediaStreamTrackControllerBase.getTrackControllersWithTrack(track).forEach(
      controller => controller.destroy()
    );

    mediaStream.removeTrack(track);
  });
}

module.exports = stopMediaStream;
