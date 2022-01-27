const { PhantomCollection } = require("phantom-core");
const AudioMediaStreamTrackLevelMonitor = require("../AudioMediaStreamTrackLevelMonitor");
const {
  /** @exports */
  EVT_AUDIO_LEVEL_UPDATED,
  /** @exports */
  EVT_AUDIO_SILENCE_STARTED,
  /** @exports */
  EVT_AUDIO_SILENCE_ENDED,
  /** @exports */
  EVT_DESTROYED,
} = AudioMediaStreamTrackLevelMonitor;

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

    // The proxy events this class should proxy from the children
    this.bindChildEventName(EVT_AUDIO_LEVEL_UPDATED);
    this.bindChildEventName(EVT_AUDIO_SILENCE_STARTED);
    this.bindChildEventName(EVT_AUDIO_SILENCE_ENDED);

    // Additional safeguard before trying to perform audio detection; This
    // shouldn't be required to be here but is good for safeguarding
    if (typeof this._lenChildren !== "number") {
      throw new ReferenceError(
        "Could not locate this._lenChildren in super class"
      );
    }
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
      throw new TypeError(
        "mediaStreamTrack is not a MediaStreamTrack instance"
      );
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
   * Adds a MediaStreamTrack to the collection.
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
   * Removes a MediaStreamTrack from the collection.
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

  /**
   * Removes all associated MediaStreamTracks and destructs their associated
   * track level monitors.
   *
   * @return {Promise<void>}
   */
  async removeAllMediaStreamTracks() {
    await this.destroyAllChildren();

    // Reset the audio level back to 0 so that any listeners to not stay
    // "stuck" on the last value
    //
    // FIXME: (jh) This used to not be required here to pass the tests; it
    // might need to be debugged in PhantomCollection
    this.emit(EVT_AUDIO_LEVEL_UPDATED, 0);
  }

  /**
   * Destructs all children and shuts down.
   *
   * @return {Promise<void>}
   */
  async destroy() {
    // Associated track level monitors should stop listening after destruct
    await this.removeAllMediaStreamTracks();

    return super.destroy();
  }
}

module.exports = MultiAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATED = EVT_AUDIO_LEVEL_UPDATED;
module.exports.EVT_AUDIO_SILENCE_STARTED = EVT_AUDIO_SILENCE_STARTED;
module.exports.EVT_AUDIO_SILENCE_ENDED = EVT_AUDIO_SILENCE_ENDED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
