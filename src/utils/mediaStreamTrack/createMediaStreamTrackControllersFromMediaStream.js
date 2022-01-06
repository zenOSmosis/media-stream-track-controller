const AudioMediaStreamTrackController = require("../../audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("../../video/VideoMediaStreamTrackController");
const { AUDIO_TRACK_KIND, VIDEO_TRACK_KIND } = require("../../constants");

/**
 * Processes inputMediaStream, converting it into audio and video track
 * controllers.
 *
 * NOTE: For most use cases, it would be better to instantiate
 * MediaStreamTrackControllerFactory instead of this, as it includes collection
 * support to manage multiple track controllers at once. The factory method
 * utilizes this utility in seed it with the initial track controllers.
 *
 * @param {MediaStream} inputMediaStream
 * @param {Object} factoryOptions? [optional; default = {}] If set, factoryOptions are
 * passed collectively to track controller constructors
 * @return {AudioMediaStreamTrackController[] & VideoMediaStreamTrackController[]}
 */
module.exports = function createMediaStreamTrackControllersFromMediaStream(
  inputMediaStream,
  factoryOptions = {}
) {
  const controllers = [];

  for (const track of inputMediaStream.getTracks()) {
    switch (track.kind) {
      case AUDIO_TRACK_KIND:
        controllers.push(
          new AudioMediaStreamTrackController(track, factoryOptions)
        );
        break;

      case VIDEO_TRACK_KIND:
        controllers.push(
          new VideoMediaStreamTrackController(track, factoryOptions)
        );
        break;

      default:
        throw new TypeError(`Unknown track kind: ${track.kind}`);
    }
  }

  return controllers;
};
