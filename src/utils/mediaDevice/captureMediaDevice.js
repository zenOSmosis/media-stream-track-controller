const MediaStreamTrackControllerFactory = require("../../MediaStreamTrackControllerFactory");
const mergeConstraints = require("../constraints/mergeConstraints");
const makeAudioConstraints = require("../constraints/makeAudioConstraints");

/**
 * Capture device media (gUM) and resolve a controller factory to manage the
 * media track(s).
 *
 * IMPORTANT: At this time, video is not captured by default but can be enabled
 * with constraints.
 *
 * For additional reading, @see https://w3c.github.io/mediacapture-main.
 *
 * @param {MediaTrackConstraints} userConstraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
module.exports = async function captureMediaDevice(
  userConstraints = {},
  factoryOptions = {}
) {
  const DEFAULT_CONSTRAINTS = {
    ...(() => {
      // Capture audio if no user constraints are provided; if audio
      // constraints are provided, merge them in with default audio
      // constraints, where userConstraints takes precedence over defaults
      if (!userConstraints || userConstraints.audio) {
        return makeAudioConstraints(userConstraints && userConstraints.audio);
      } else {
        return {};
      }
    })(),

    // FIXME: Implement video constraints if video will be captured by default
    // ...createDefaultVideoConstraints(userConstraints && userConstraints.video),
    video: false,
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(
    mergeConstraints(DEFAULT_CONSTRAINTS, userConstraints)
  );

  return new MediaStreamTrackControllerFactory(mediaStream, factoryOptions);
};
