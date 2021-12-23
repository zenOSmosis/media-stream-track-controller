const MediaStreamTrackControllerFactory = require("../../MediaStreamTrackControllerFactory");
const makeScreenCaptureConstraints = require("../constraints/makeScreenCaptureConstraints");

/**
 * Capture screen  content and resolve a controller factory to manage the media
 * track(s).
 *
 * For additional reading, @see https://w3c.github.io/mediacapture-main.
 *
 * @param {MediaTrackConstraints} userConstraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
module.exports = async function captureScreen(
  userConstraints = {},
  factoryOptions = {}
) {
  const mediaStream = await navigator.mediaDevices.getDisplayMedia(
    makeScreenCaptureConstraints(userConstraints)
  );

  return new MediaStreamTrackControllerFactory(mediaStream, factoryOptions);
};
