const stopMediaStreamTrack = require("../mediaStreamTrack/stopMediaStreamTrack");

/**
 * Stops all of the tracks of the given MediaStream, then removes them from the
 * stream.
 *
 * @param {MediaStream} mediaStream
 * @return {void}
 */
module.exports = function stopMediaStream(mediaStream) {
  mediaStream.getTracks().forEach(track => {
    stopMediaStreamTrack(track);

    mediaStream.removeTrack(track);
  });
};
