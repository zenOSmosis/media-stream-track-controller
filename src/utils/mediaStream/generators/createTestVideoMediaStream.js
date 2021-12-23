const { stopMediaStream } = require("../utils");
const { logger } = require("phantom-core");

/**
 * Returns a MediaStream with a single test video track which automatically
 * ends at the specified duration.
 *
 * @param {number} duration? [default = 5] Number of seconds the pulse should
 * last.
 * @return {MediaStream}
 */
module.exports = function createTestVideoMediaStream(duration = 5) {
  const canvas = document.createElement("canvas");

  document.body.appendChild(canvas);

  const mediaStream = canvas.captureStream(25);

  setTimeout(() => {
    stopMediaStream(mediaStream);

    document.body.removeChild(canvas);

    logger.log("stopped media stream");
  }, duration * 1000);

  return mediaStream;
};
