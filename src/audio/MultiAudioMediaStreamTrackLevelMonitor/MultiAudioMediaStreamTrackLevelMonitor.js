const { PhantomCollection } = require("phantom-core");
const { EVT_CHILD_INSTANCE_ADDED, EVT_CHILD_INSTANCE_REMOVED } =
  PhantomCollection;
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

/**
 * Listens to the audio levels of multiple audio tracks at once and emits a
 * debounced peak audio level on each cycle of all of the children audio level
 * listeners.
 *
 * Uses MediaStreamTracks themselves as PhantomCore instances by internally
 * binding AudioMediaStreamTrackLevelMonitor instances to them when added as
 * children.
 *
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

    // Used so we don't have to figure this out on every audio tick
    this._lenChildren = this.getChildren().length;

    (() => {
      // Keep this._lenChildren in sync w/ number of actual children
      const _handleChildrenUpdate = () =>
        (this._lenChildren = this.getChildren().length);

      this.on(EVT_CHILD_INSTANCE_ADDED, _handleChildrenUpdate);
      this.on(EVT_CHILD_INSTANCE_REMOVED, _handleChildrenUpdate);
    })();

    // TODO: Document; both are used for debounced peak audio level
    // determination
    this._childTickIdx = -1;
    this._currentPeakLevel = 0;
  }

  // TODO: Implement
  // Called when any child module emits an audio level
  _handleAudioLevelTick(audioLevel) {
    ++this._childTickIdx;

    // TODO: Remove
    console.warn({
      TODO: "Finish building out debounce peak audio level tick handling",
      audioLevel,
    });

    if (!((this._childTickIdx + 1) % this._lenChildren)) {
      this.emit(EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK, this._currentPeakLevel);

      // Reset
      this._childTickIdx = -1;
      this._currentPeakLevel = 0;
    } else {
      // TODO: Determine peak level from audio level and set it
      // if (audioLevel > this._currentPeakLevel) {
      // this._currentPeakLevel = audioLevel
      // }
    }
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

  /**
   * Adds a MediaStreamTrack to the given collection.
   *
   * If a duplicate track is added, it will silently ignore the duplicate.
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @return {void}
   */
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

  /**
   * Adds a MediaStreamTrack to the given collection.
   *
   * If a duplicate track is added, it will silently ignore the duplicate.
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @return {void}
   */
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

  /**
   * Removes the given MediaStreamTrack or associated
   * AudioMediaStreamTrackLevelMonitor from the underlying collection.
   *
   * IMPORTANT: This overrides the super's synchronous handling w/
   * asynchronous (we're returning a promise here).
   *
   * @param {MediaStreamTrack | AudioMediaStreamTrackLevelMonitor} trackOrMonitor
   * @return {Promise<void>} NOTE: A promise is used because it needs to shut
   * down the associated track level monitor, which is an asynchronous call.
   */
  async removeChild(trackOrMonitor) {
    if (
      !(trackOrMonitor instanceof MediaStreamTrack) &&
      !(trackOrMonitor instanceof AudioMediaStreamTrackLevelMonitor)
    ) {
      throw new TypeError(
        "trackOrMonitor must be either a MediaStreamTrack or AudioMediaStreamTrackLevelMonitor"
      );
    }

    /** @type {AudioMediaStreamTrackLevelMonitor} */
    const trackLevelMonitor =
      trackOrMonitor instanceof AudioMediaStreamTrackLevelMonitor
        ? trackOrMonitor
        : this.getChildWithKey(trackOrMonitor.id);

    if (trackLevelMonitor) {
      // NOTE: Destroying the track should also remove the child from super,
      // but to be on the safe side, we'll just call it anyway
      super.removeChild(trackLevelMonitor);

      return trackLevelMonitor.destroy();
    }
  }

  /**
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @return {Promise<void>} NOTE: A promise is used because it needs to shut
   * down the associated track level monitor, which is an asynchronous call.
   */
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
