const { PhantomCollection } = require("phantom-core");
const AudioMediaStreamTrackLevelMonitor = require("../AudioMediaStreamTrackLevelMonitor");
const {
  /** @exports */
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
  /** @exports */
  EVT_AUDIO_LEVEL_TICK,
  /** @exports */
  EVT_AUDIO_ERROR,
  /** @exports */
  EVT_AUDIO_ERROR_RECOVERED,
} = AudioMediaStreamTrackLevelMonitor;

/** @exports */
const EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK = `debounced-peak-${EVT_AUDIO_LEVEL_TICK}`;

// TODO: Document
// TODO: State that all tracks can be removed and the multi-monitor will stay running
/**
 * IMPORTANT: This is intentionally designed so that all tracks can be removed
 * during runtime and the multi-monitor will stay running.
 */
class MultiAudioMediaStreamTrackLevelMonitor extends PhantomCollection {
  constructor(initialMediaStreamTracks = []) {
    super(initialMediaStreamTracks);

    // Determine which events the children may emit that we want to re-emit out
    // the collection itself
    this.bindChildEventName(EVT_AVERAGE_AUDIO_LEVEL_CHANGED);
    this.bindChildEventName(EVT_AUDIO_ERROR);
    this.bindChildEventName(EVT_AUDIO_ERROR_RECOVERED);
    this.bindChildEventName(EVT_AUDIO_LEVEL_TICK);

    this._handleAudioLevelTick = this._handleAudioLevelTick.bind(this);

    this.on(EVT_AUDIO_LEVEL_TICK, this._handleAudioLevelTick);
  }

  // TODO: Implement
  // Called when any child module emits an audio level
  _handleAudioLevelTick(audioLevel) {
    // TODO: Remove
    console.warn({
      TODO: "Build out debounce peak audio level tick handling",
      audioLevel,
    });

    // TODO: Get number of children and use % (modulus) to determine when to EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK

    // TODO: Integrate w/ EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK
  }

  /**
   * Destructs all children and shuts down.
   *
   * @return {Promise<void>}
   */
  async destroy() {
    // Associated track level monitors should stop listening after destruct
    await this.removeAllMediaStreamTracks();

    return this.destroy();
  }

  // TODO: Document
  addChild(mediaStreamTrack) {
    if (!(mediaStreamTrack instanceof MediaStreamTrack)) {
      throw new TypeError("mediaStreamTrack is not a MediaStreamTrack");
    }

    // Ignore attempts to add duplicate tracks
    if (this.getChildWithKey(mediaStreamTrack.id)) {
      return;
    }

    // Add track level monitor around the given MediaStreamTrack
    super.addChild(
      new AudioMediaStreamTrackLevelMonitor(mediaStreamTrack),
      mediaStreamTrack.id
    );
  }

  // TODO: Document
  addMediaStreamTrack(mediaStreamTrack) {
    return this.addChild(mediaStreamTrack);
  }

  /**
   * Removes all associated MediaStreamTracks and destructs their associated
   * track level monitors.
   *
   * @return {Promise<void>}
   */
  removeAllMediaStreamTracks() {
    return this.destroyAllChildren();
  }

  // TODO: Document
  /**
   *
   * @param {MediaStreamTrack | AudioMediaStreamTrackLevelMonitor} child
   * @return {Promise<void>} A promise is used because it needs to shut down the underlying track level monitor.
   */
  async removeChild(child) {
    if (
      !(child instanceof MediaStreamTrack) &&
      !(child instanceof AudioMediaStreamTrackLevelMonitor)
    ) {
      throw new TypeError(
        "child must be either a MediaStreamTrack or AudioMediaStreamTrackLevelMonitor"
      );
    }

    // TODO: Remove
    if (typeof child === "string") {
      throw "?";
    }

    const trackLevelMonitor =
      child instanceof AudioMediaStreamTrackLevelMonitor
        ? child
        : this.getChildWithKey(child.id);

    if (trackLevelMonitor) {
      // NOTE: Destroying the track should also remove the child from super,
      // but to be on the safe side, we'll just call it anyway
      super.removeChild(trackLevelMonitor);

      return trackLevelMonitor.destroy();
    }
  }

  // TODO: Document
  async removeMediaStreamTrack(mediaStreamTrack) {
    return this.removeChild(mediaStreamTrack);
  }

  /**
   * Retrieves the mapped media stream tracks which are bound to this instance.
   *
   * @return {MediaStreamTrack[]}
   */
  getMediaStreamTracks() {
    return this.getChildren().map(trackLevelMonitor =>
      trackLevelMonitor.getMediaStreamTrack()
    );
  }
}

module.exports = MultiAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AVERAGE_AUDIO_LEVEL_CHANGED =
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED;
module.exports.EVT_AUDIO_LEVEL_TICK = EVT_AUDIO_LEVEL_TICK;
module.exports.EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK =
  EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK;
module.exports.EVT_AUDIO_ERROR = EVT_AUDIO_ERROR;
module.exports.EVT_AUDIO_ERROR_RECOVERED = EVT_AUDIO_ERROR_RECOVERED;
