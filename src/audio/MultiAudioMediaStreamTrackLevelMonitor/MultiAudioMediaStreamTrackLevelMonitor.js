const { PhantomCollection } = require("phantom-core");
const AudioMediaStreamTrackLevelMonitor = require("../AudioMediaStreamTrackLevelMonitor");
const {
  /** @export */
  EVT_AUDIO_LEVEL_UPDATED,
  /** @export */
  EVT_AUDIO_SILENCE_STARTED,
  /** @export */
  EVT_AUDIO_SILENCE_ENDED,
  /** @export */
  EVT_DESTROY,
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

    if (trackLevelMonitor && !trackLevelMonitor.UNSAFE_getIsDestroying()) {
      await trackLevelMonitor.destroy();
    }

    return super.removeChild(trackOrMonitor);
  }

  /**
   * Removes a MediaStreamTrack from the collection and destructs its
   * associated track level monitor.
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @return {Promise<void>} NOTE: A promise is used because it needs to shut
   * down the associated track level monitor, which is an asynchronous call.
   */
  async removeMediaStreamTrack(mediaStreamTrack) {
    return this.removeChild(mediaStreamTrack);
  }

  /**
   * Removes all associated MediaStreamTracks and destructs their associated
   * track level monitors.
   *
   * @return {Promise<void>}
   */
  async removeAllMediaStreamTracks() {
    return this.destroyAllChildren();
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
   * Retrieves whether or not all associated audio streams are silent.
   *
   * @return {boolean}
   */
  getIsSilent() {
    return this.getChildren().every(child => child.getIsSilent());
  }

  /**
   * Destructs all children and shuts down.
   *
   * TODO: Utilize destroyHandler?
   * @return {Promise<void>}
   */
  async destroy() {
    return super.destroy(async () => {
      // Associated track level monitors should stop listening after destruct

      await this.removeAllMediaStreamTracks();
    });
  }
}

module.exports = MultiAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATED = EVT_AUDIO_LEVEL_UPDATED;
module.exports.EVT_AUDIO_SILENCE_STARTED = EVT_AUDIO_SILENCE_STARTED;
module.exports.EVT_AUDIO_SILENCE_ENDED = EVT_AUDIO_SILENCE_ENDED;
module.exports.EVT_DESTROY = EVT_DESTROY;
