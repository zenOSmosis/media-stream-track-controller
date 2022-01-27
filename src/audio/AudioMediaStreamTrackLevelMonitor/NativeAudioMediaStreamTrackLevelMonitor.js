const PhantomCore = require("phantom-core");
const { /** @exports */ EVT_DESTROYED } = PhantomCore;
const getSharedAudioContext = require("../../utils/audioContext/getSharedAudioContext");
const { AUDIO_TRACK_KIND } = require("../../constants");

/** @exports */
const EVT_AUDIO_LEVEL_UPDATED = "audio-level-updated";

/** @exports */
const EVT_AUDIO_SILENCE_STARTED = "audio-error";

/** @exports */
const EVT_AUDIO_SILENCE_ENDED = "audio-error-recovered";

// Number of ms to wait before track silence should raise an error
const SILENCE_DETECTION_THRESHOLD_TIME = 1000;

// Number of ms wait before capturing next audio frame
const DEFAULT_TICK_TIME = 100;

// TODO: Integrate AudioWorkletNode processing:
//  - https://www.w3.org/TR/webaudio/#vu-meter-mode
//  - https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet

/**
 * Directly listens to the given audio MediaStreamTrack.
 *
 * Portions of this class were derived from Twilio's Reference React App:
 * @see {@link https://github.com/twilio/twilio-video-app-react/blob/master/src/components/AudioLevelIndicator/AudioLevelIndicator.tsx}
 *
 * IMPORTANT: For most purposes, this class should not be used directly,
 * because it is not CPU efficient when multiple listeners are attached to the
 * same MediaStreamTrack.  The AudioMediaStreamTrackLevelMonitor remediates
 * that by proxying events from multiple programmatic listeners to this native
 * monitor.
 */
class NativeAudioMediaStreamTrackLevelMonitor extends PhantomCore {
  /**
   * TODO: Look into reference which uses "rms pressure" reference:
   * @see {@link https://dosits.org/science/advanced-topics/introduction-to-signal-levels }
   *
   * @see {@link https://www.w3.org/TR/webrtc-stats/#dom-rtcinboundrtpstreamstats-audiolevel}
   * @see {@link https://www.w3.org/TR/webrtc-stats/#dom-rtcinboundrtpstreamstats-totalaudioenergy}
   *
   * @param {Uint8Array} samples
   * @return {number} TODO: Verify this is correct; should it be 0 - 1 instead? A float value between 0 - 100
   */
  static calculateRMSPressure(samples) {
    const sumSq = samples.reduce((sumSq, sample) => sumSq + sample * sample, 0);
    return Math.sqrt(sumSq / samples.length);
  }

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

    // window.setTimeout used for silence-to-error detection
    this._silenceDetectionTimeout = null;

    this._isSilent = false;

    this._prevRMS = 0;

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
    const initTimeout = window.setTimeout(
      () => this._initAudioLevelPolling(),
      50
    );
    this.registerShutdownHandler(() => window.clearTimeout(initTimeout));
  }

  /**
   * Note: If this is called more than once, it will re-start the polling sequence.
   *
   * Derived from Twilio's documentation.
   * @link https://www.twilio.com/docs/video/build-js-video-application-recommendations-and-best-practices
   *
   * @return {Promise<void>}
   */
  async _initAudioLevelPolling() {
    // Stop previous polling, if already started
    // TODO: Rename / document further
    if (this._tickInterval) {
      window.clearInterval(this._tickInterval);
    }

    if (this._silenceDetectionTimeout) {
      window.clearTimeout(this._silenceDetectionTimeout);
    }

    // If we're destroyed, there's nothing we can do about it
    if (this._isDestroyed) {
      return;
    }

    // TODO: Use OfflineAudioContext, if possible... should be a lot more performant
    const audioContext = getSharedAudioContext();

    // Due to browsers' autoplay policy, the AudioContext is only active after
    // the user has interacted with your app, after which the Promise returned
    // here is resolved
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

      this.registerShutdownHandler(() => this._analyser.disconnect());

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

      this.registerShutdownHandler(() =>
        this._source.disconnect(this._analyser)
      );
    }

    if (!this._samples) {
      this._samples = new Uint8Array(this._analyser.frequencyBinCount);
    }

    // Set initial audio level to 0
    this._audioLevelDidUpdate(0);

    // Start polling for audio level detection
    this._tickInterval = window.setInterval(
      () => this._handleTick(),
      // TODO: Allow this setting to be user-overridable
      DEFAULT_TICK_TIME
    );
  }

  /**
   * Handles one tick cycle of audio level polling by capturing the audio
   * frequency data and then sending it to the audio level checker.
   *
   * @return {void}
   */
  _handleTick() {
    if (this._isDestroyed) {
      return;
    }

    this._analyser.getByteFrequencyData(this._samples);
    const rms = NativeAudioMediaStreamTrackLevelMonitor.calculateRMSPressure(
      this._samples
    );

    if (this._prevRMS !== rms) {
      this._prevRMS = rms;

      this._audioLevelDidUpdate(rms);
    }
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
   * Internally called after audio level has changed.
   *
   * @param {number} audioLevel Float range from 0 - 100, representing RMS
   * level.
   */
  _audioLevelDidUpdate(audioLevel) {
    this._audioLevel = audioLevel;

    if (!audioLevel) {
      this._silenceDidPotentiallyStart();
    } else {
      this._silenceDidPotentiallyEnd();
    }

    this.emit(EVT_AUDIO_LEVEL_UPDATED, audioLevel);
  }

  /**
   * Internally called after period of silence has started.
   *
   * @return {void}
   */
  _silenceDidPotentiallyStart() {
    if (this._silenceDetectionTimeout) {
      window.clearTimeout(this._silenceDetectionTimeout);
    }

    this._silenceDetectionTimeout = window.setTimeout(() => {
      if (this._isDestroyed) {
        return;
      }

      this._isSilent = true;

      // FIXME: (jh) Keep or change to debug
      this.log.warn("Silence detected");

      // Tell interested listeners
      this.emit(EVT_AUDIO_SILENCE_STARTED);
    }, SILENCE_DETECTION_THRESHOLD_TIME);
  }

  /**
   * Internally called after period of silence has ended.
   *
   * @return {void}
   */
  _silenceDidPotentiallyEnd() {
    if (this._silenceDetectionTimeout) {
      window.clearTimeout(this._silenceDetectionTimeout);
    }

    // Detect if existing error should be a false-positive
    if (this._isSilent) {
      this._isSilent = false;

      this.emit(EVT_AUDIO_SILENCE_ENDED);
    }
  }

  /**
   * @return {boolean}
   */
  getIsSilent() {
    return this._isSilent();
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    if (this._tickInterval) {
      window.clearInterval(this._tickInterval);
    }

    if (this._silenceDetectionTimeout) {
      window.clearTimeout(this._silenceDetectionTimeout);
    }

    // NOTE: This is a cloned MediaStreamTrack and it does not stop the input
    // track on its own (nor should it).  This prevents an issue in Google
    // Chrome (maybe others) where the recording indicator would stay lit after
    // the source has been stopped.
    this._mediaStreamTrack.stop();

    // Reset the audio level back to 0 so that any listeners to not stay
    // "stuck" on the last value
    this._audioLevelDidUpdate(0);

    await super.destroy();
  }
}

module.exports = NativeAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATED = EVT_AUDIO_LEVEL_UPDATED;
module.exports.EVT_AUDIO_SILENCE_STARTED = EVT_AUDIO_SILENCE_STARTED;
module.exports.EVT_AUDIO_SILENCE_ENDED = EVT_AUDIO_SILENCE_ENDED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
