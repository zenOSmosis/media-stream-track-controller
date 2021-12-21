const { getNewAudioContext, stopMediaStream } = require("../utils");
const { logger } = require("phantom-core");

/**
 * Returns an empty MediaStream container which automatically ends at the
 * specified duration.
 *
 * @param {number} duration? [default = 5] Number of seconds the pulse should
 * last.
 * @return {MediaStream}
 */
module.exports = function createEmptyAudioMediaStream(duration = 5) {
  const audioCtx = getNewAudioContext();

  const streamOutput = audioCtx.createMediaStreamDestination();

  const mediaStream = streamOutput.stream;

  // Stop the stream once the pulse time ends
  setTimeout(() => {
    stopMediaStream(mediaStream);

    logger.log("stopped media stream");

    audioCtx.close().then(() => logger.log("audio context closed"));
  }, duration * 1000);

  return mediaStream;
};
