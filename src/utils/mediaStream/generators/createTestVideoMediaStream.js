const stopMediaStream = require("../stopMediaStream");
const { logger } = require("phantom-core");

/**
 * Returns a MediaStream with a single test video track which automatically
 * ends at the specified duration.
 *
 * @param {number} duration? [default = 10000] Number of milliseconds the pulse should
 * last.
 * @return {MediaStream}
 */
module.exports = function createTestVideoMediaStream(duration = 10000) {
  const canvas = document.createElement("canvas");

  document.body.appendChild(canvas);

  const mediaStream = canvas.captureStream(25);

  setTimeout(() => {
    stopMediaStream(mediaStream);

    document.body.removeChild(canvas);

    logger.debug("Stopped media stream");
  }, duration);

  return mediaStream;
};
