const MediaStreamTrackControllerBase = require("../_MediaStreamTrackControllerBase");
const { EVT_UPDATED, EVT_DESTROYED } = MediaStreamTrackControllerBase;

/**
 * Utilized for live-manipulation of video MediaStreamTrack instances.
 */
class VideoMediaStreamTrackController extends MediaStreamTrackControllerBase {
  /**
   * @param {MediaStreamTrack} inputMediaStreamTrack
   * @param {Object} options? [default = {}]
   */
  constructor(inputMediaStreamTrack, options = {}) {
    if (inputMediaStreamTrack.kind !== "video") {
      throw new TypeError("inputMediaStreamTrack is not of video type");
    }

    super(inputMediaStreamTrack, options);
  }

  setIsMuted(isMuted) {
    console.warn("video setIsMuted is not currently implemented");

    // TODO: Implement ability to mute video
    super.setIsMuted(isMuted);
  }
}

module.exports = VideoMediaStreamTrackController;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
