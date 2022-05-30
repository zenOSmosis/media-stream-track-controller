const MediaStreamTrackControllerBase = require("../_base/_MediaStreamTrackControllerBase");
const { EVT_UPDATE, EVT_DESTROY } = MediaStreamTrackControllerBase;

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

  /**
   * @param {boolean} isMuted
   * @return {Promise<void>}
   */
  setIsMuted(isMuted) {
    this.log.warn("video setIsMuted is not currently implemented");

    // TODO: Implement ability to mute video
    return super.setIsMuted(isMuted);
  }
}

module.exports = VideoMediaStreamTrackController;
module.exports.EVT_UPDATE = EVT_UPDATE;
module.exports.EVT_DESTROY = EVT_DESTROY;
