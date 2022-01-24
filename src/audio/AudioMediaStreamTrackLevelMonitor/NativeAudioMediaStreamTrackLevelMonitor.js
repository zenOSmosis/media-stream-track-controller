const PhantomCore = require("phantom-core");
const { /** @exports */ EVT_DESTROYED } = PhantomCore;
const getSharedAudioContext = require("../../utils/audioContext/getSharedAudioContext");
const { AUDIO_TRACK_KIND } = require("../../constants");
const { interval, timeout } = require("d3-timer");

// Emits after audio level has changed, with a value from 0 - 10
/** @exports */
const EVT_AVERAGE_AUDIO_LEVEL_CHANGED = "audio-level-changed";

/** @exports */
const EVT_AUDIO_LEVEL_TICK = "audio-level-tick";

/** @exports */
const EVT_AUDIO_ERROR = "audio-error";

/** @exports */
const EVT_AUDIO_ERROR_RECOVERED = "audio-error-recovered";

// Number of ms to wait before track silence should raise an error
const SILENCE_TO_ERROR_THRESHOLD_TIME = 10000;

// Audio level is changed to this value when muting is specified, regardless
// whether there is audio in the stream or not
const MUTED_AUDIO_LEVEL = -1;

// Number of ms wait before capturing next audio frame
const DEFAULT_TICK_TIME = 100;

/**
 * Directly listens to the given audio MediaStreamTrack.
 *
 * IMPORTANT: For most purposes, this class should not be used directly,
 * because it is not CPU efficient when multiple listeners are attached to the
 * same MediaStreamTrack.  The AudioMediaStreamTrackLevelMonitor remediates
 * that by proxying events from multiple programmatic listeners to this native
 * monitor.
 */
class NativeAudioMediaStreamTrackLevelMonitor extends PhantomCore {
  /**
   * Validates the given MediaStreamTrack, throwing an exception if it is not
   * of valid type for use here.
   *
   * @param {MediaStreamTrack} mediaStreamTrack An audio MediaStreamTrack.
   * @throws {TypeError}
   * @return {void}
   */
  static validateAudioTrack(mediaStreamTrack) {
    if (!(mediaStreamTrack instanceof MediaStreamTrack)) {
      throw new TypeError(
        "mediaStreamTrack should be of MediaStreamTrack type"
      );
    }

    if (mediaStreamTrack.kind !== AUDIO_TRACK_KIND) {
      throw new TypeError("mediaStreamTrack is not an audio track");
    }
  }

  /**
   * @param {MediaStreamTrack} mediaStreamTrack The track from which to monitor
   * the audio levels. Must be of audio type.
   */
  constructor(mediaStreamTrack) {
    NativeAudioMediaStreamTrackLevelMonitor.validateAudioTrack(
      mediaStreamTrack
    );

    super();

    this._inputMediaStreamTrack = mediaStreamTrack;

    // IMPORTANT: Using a clone of the MediaStreamTrack is necessary because
    // iOS may not work correctly here if multiple readings are of the same
    // track
    this._mediaStreamTrack = mediaStreamTrack.clone();

    // d3 timeout instance used for silence-to-error detection
    this._silenceErrorDetectionTimeout = null;

    // Error, if set, of silence
    this._silenceAudioError = null;

    this._prevAudioLevel = 0;

    this._isMuted = false;

    this._analyser = null;
    this._stream = null;
    this._source = null;

    // Will be populated w/ Uint8Array once initialized
    this._samples = null;

    // Handle automatic cleanup once track ends
    mediaStreamTrack.addEventListener("ended", () => {
      this.destroy();
    });

    // TODO: Cite reference link for Twilio audio level indicator
    // (Modified from AudioLevelIndicator.tsx in Twilio Video App React demo app)
    //
    // Here we re-initialize the AnalyserNode on focus to avoid an issue in Safari
    // where the analyzers stop functioning when the user switches to a new tab
    // and switches back to the app.
    (() => {
      const _handleFocus = () => this._initAudioLevelPolling();

      window.addEventListener("focus", _handleFocus);

      this.once(EVT_DESTROYED, () => {
        window.removeEventListener("focus", _handleFocus);
      });
    })();

    // Start initial polling
    // IMPORTANT: This doesn't use normal PhantomCore async init convention because it may be called more than once to restart the polling sequence
    const initTimeout = timeout(() => this._initAudioLevelPolling(), 50);
    this.registerShutdownHandler(() => initTimeout.stop());
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    if (this._tickInterval) {
      this._tickInterval.stop();
    }

    if (this._silenceErrorDetectionTimeout) {
      this._silenceErrorDetectionTimeout.stop();
    }

    // NOTE: This is a cloned MediaStreamTrack and it does not stop the input
    // track on its own (nor should it).  This prevents an issue in Google
    // Chrome (maybe others) where the recording indicator would stay lit after
    // the source has been stopped.
    this._mediaStreamTrack.stop();

    // Reset the levels
    //
    // TODO: Typedef this object
    this.emit(EVT_AUDIO_LEVEL_TICK, {
      rms: 0,
      log2Rms: 0,
    });

    await super.destroy();
  }

  /**
   * Retrieves the original MediaStreamTrack which this instance was
   * instantiated with.
   *
   * @return {MediaStreamTrack}
   */
  getMediaStreamTrack() {
    return this._inputMediaStreamTrack;
  }

  /**
   * Note: If this is called more than once, it will re-start the polling sequence.
   *
   * Derived from Twilio's documentation.
   * @link https://www.twilio.com/docs/video/build-js-video-application-recommendations-and-best-practices
   */
  async _initAudioLevelPolling() {
    // Stop previous polling, if already started
    // TODO: Rename / document further
    if (this._tickInterval) {
      this._tickInterval.stop();
    }

    if (this._silenceErrorDetectionTimeout) {
      this._silenceErrorDetectionTimeout.stop();
    }

    // If we're destroyed, there's nothing we can do about it
    if (this._isDestroyed) {
      return;
    }

    // TODO: Use OfflineAudioContext, if possible... should be a lot more performant
    const audioContext = getSharedAudioContext();

    // Due to browsers' autoplay policy, the AudioContext is only active after
    // the user has interacted with your app, after which the Promise returned
    // here is resolved.
    await audioContext.resume();

    // This class may have a rapid lifecycle inside of a React component, so
    // this subsequent check will ensure we're still running and prevent
    // potential errors
    if (this.getIsDestroyed()) {
      return;
    }

    this._isAudioContextStarted = true;
    // this.emit(EVT_AUDIO_CONTEXT_STARTED);

    const mediaStreamTrack = this._mediaStreamTrack;

    if (!mediaStreamTrack) {
      throw new Error("Could not obtain MediaStreamTrack");
    }

    // Create an analyser to access the raw audio samples from the microphone.
    if (!this._analyser) {
      this._analyser = audioContext.createAnalyser();

      // TODO: Can this fftSize be optimized?  Look at Twilio's version
      // TODO: Make this user-configurable
      // Analyser config derived from https://github.com/twilio/twilio-video-app-react/blob/master/src/components/AudioLevelIndicator/AudioLevelIndicator.tsx#L20
      this._analyser.fftSize = 256;
      this._analyser.smoothingTimeConstant = 0.5;
    }

    if (!this._stream) {
      this._stream = new MediaStream([mediaStreamTrack]);
    }

    if (!this._source) {
      // Connect the LocalAudioTrack's media source to the analyser.
      // Note: Creating a new MediaStream here to avoid having to pass a
      // MediaStream to this class
      this._source = audioContext.createMediaStreamSource(this._stream);
      this._source.connect(this._analyser);

      this.once(EVT_DESTROYED, () => {
        this._source.disconnect(this._analyser);
      });
    }

    if (!this._samples) {
      this._samples = new Uint8Array(this._analyser.frequencyBinCount);
    }

    // Start initial detection
    this.audioLevelDidChange(0);

    // Start polling for audio level detection
    this._tickInterval = interval(
      // NOTE: _handlePollTick will retain scope reference to this class
      // because of PhantomCore bindings
      this._handlePollTick,
      // TODO: Allow this setting to be user-overridable
      DEFAULT_TICK_TIME
    );
  }

  // TODO: Document
  _emitAudioLevelTick({ rms = 0, log2Rms = 0 }) {
    this.emit(EVT_AUDIO_LEVEL_TICK, {
      rms,
      log2Rms,
    });
  }

  // TODO: Rename
  /**
   * Handles one tick cycle of audio level polling by capturing the audio
   * frequency data and then sending it to the audio level checker.
   *
   * @return {void}
   */
  _handlePollTick() {
    if (this._isDestroyed) {
      return;
    }

    // Note: For debugging: A way to simulate unintentional silence is to force
    // this._isMuted to true, while also muting a device's audio. That will
    // convince the following code into thinking there's unintentional silence.

    if (this._isMuted) {
      if (this._prevAudioLevel !== MUTED_AUDIO_LEVEL) {
        this._prevAudioLevel = MUTED_AUDIO_LEVEL;

        this.audioLevelDidChange(MUTED_AUDIO_LEVEL);
      }
    } else {
      this._analyser.getByteFrequencyData(this._samples);
      const rms = this.calculateRMS(this._samples);
      const log2Rms = rms && Math.log2(rms);

      // Clear any levels
      this._emitAudioLevelTick({ rms, log2Rms });

      // Audio audioLevel ranges from 0 (silence) to 10 (loudest).
      let newAudioLevel = Math.ceil(log2Rms); // Our version; shows quieter, emits more often
      // let newAudioLevel = Math.ceil((10 * log2Rms) / 8); // Twilio version; shows louder

      if (newAudioLevel < 0) {
        newAudioLevel = 0;
      } else if (newAudioLevel > 10) {
        newAudioLevel = 10;
      }

      if (this._prevAudioLevel !== newAudioLevel) {
        this._prevAudioLevel = newAudioLevel;

        this.audioLevelDidChange(newAudioLevel);
      }
    }
  }

  /**
   * @param {Uint8Array} samples
   * @return {number}
   */
  calculateRMS(samples) {
    const sumSq = samples.reduce((sumSq, sample) => sumSq + sample * sample, 0);
    return Math.sqrt(sumSq / samples.length);
  }

  /**
   * Sets whether the audio for this track should be treated as its muted,
   * regardless if there is audio data available in the monitor.
   *
   * @param {boolean}
   */
  setIsMuted(isMuted) {
    if (isMuted === this._isMuted) {
      // Silently ignore
      return;
    }

    this.log(`Setting muted state to ${isMuted ? "true" : "false"}`);

    this._isMuted = isMuted;
  }

  /**
   * Called after audio level has changed.
   *
   * @param {number} audioLevel
   */
  audioLevelDidChange(audioLevel) {
    this._audioLevel = audioLevel;

    if (!audioLevel) {
      this.silenceDidStart();
    } else {
      this.silenceDidEnd();
    }

    this.emit(EVT_AVERAGE_AUDIO_LEVEL_CHANGED, audioLevel);
  }

  /**
   * Called after period of silence has started.
   */
  silenceDidStart() {
    if (this._silenceErrorDetectionTimeout) {
      this._silenceErrorDetectionTimeout.stop();
    }

    this._silenceErrorDetectionTimeout = timeout(() => {
      if (this._isDestroyed || this._isMuted) {
        return;
      }

      this._silenceAudioError = new Error(
        "Unintentional silence grace period over"
      );

      // Silently fail
      this.log.error(this._silenceAudioError.message);

      // Tell interested listeners
      this.emit(EVT_AUDIO_ERROR, this._silenceAudioError);
    }, SILENCE_TO_ERROR_THRESHOLD_TIME);
  }

  /**
   * Called after period of silence has ended.
   */
  silenceDidEnd() {
    if (this._silenceErrorDetectionTimeout) {
      this._silenceErrorDetectionTimeout.stop();
    }

    // Detect if existing error should be a false-positive
    if (this._silenceAudioError) {
      const audioError = this._silenceAudioError;

      this._silenceAudioError = null;

      this.emit(EVT_AUDIO_ERROR_RECOVERED, audioError);
    }
  }
}

module.exports = NativeAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AVERAGE_AUDIO_LEVEL_CHANGED =
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED;
module.exports.EVT_AUDIO_LEVEL_TICK = EVT_AUDIO_LEVEL_TICK;
module.exports.EVT_AUDIO_ERROR = EVT_AUDIO_ERROR;
module.exports.EVT_AUDIO_ERROR_RECOVERED = EVT_AUDIO_ERROR_RECOVERED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
