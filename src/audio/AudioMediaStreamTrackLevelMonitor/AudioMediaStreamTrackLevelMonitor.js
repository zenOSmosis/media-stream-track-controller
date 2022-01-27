const PhantomCore = require("phantom-core");
const { logger } = PhantomCore;
const NativeAudioMediaStreamTrackLevelMonitor = require("./NativeAudioMediaStreamTrackLevelMonitor");
const {
  /** @exports */
  EVT_AUDIO_LEVEL_UPDATED,
  /** @exports */
  EVT_AUDIO_SILENCE_STARTED,
  /** @exports */
  EVT_AUDIO_SILENCE_ENDED,
  /** @exports */
  EVT_DESTROYED,
} = NativeAudioMediaStreamTrackLevelMonitor;

/**
 * The underlying audio monitors which are being proxied to, keyed by the
 * respective MediaStreamTrack id.
 *
 * @type {{key: string, value: AudioMediaStreamTrackLevelMonitor}}
 */
const _monitorInstances = {};

/**
 * The number of proxies, per MediaStreamTrack id.
 *
 * @type {{key: string, value: number}}}
 */
const _proxyCounts = {};

/**
 * Exposed proxy for NativeAudioMediaStreamTrackLevelMonitor.
 *
 * New instances of this class can be constructed, reusing the same
 * MediaStreamTrack across instances, and (in order to make CPU
 * usage more efficient) if two or more proxy listeners are listening to the
 * same MediaStreamTrack, only one NativeAudioMediaStreamTrackLevelMonitor will
 * be utilized for that particular MediaStreamTrack, regardless of the amount
 * of proxy listeners.
 */
class AudioMediaStreamTrackLevelMonitor extends PhantomCore {
  /**
   * Adds a proxy instance to the audio level monitor.
   *
   * If no audio level monitor the proxied MediaStreamTrack is present, it will
   * create the monitor.
   *
   * On proxy destruct, if no remaining proxies for the monitor are present, it
   * will destroy the audio level monitor.
   *
   * @param {AudioMediaStreamTrackLevelMonitor} proxy
   * @return {void}
   */
  static addProxyInstance(proxy) {
    if (!(proxy instanceof AudioMediaStreamTrackLevelMonitor)) {
      throw new TypeError(
        "proxy is not an AudioMediaStreamTrackLevelMonitor instance"
      );
    }

    const mediaStreamTrack = proxy.getMediaStreamTrack();

    let nativeMonitor = _monitorInstances[mediaStreamTrack.id];

    if (!nativeMonitor) {
      nativeMonitor = new NativeAudioMediaStreamTrackLevelMonitor(
        mediaStreamTrack
      );

      // Handle monitor destroy
      //
      // Remove all proxies for the given audio level monitor
      nativeMonitor.once(EVT_DESTROYED, () => {
        const proxies = _proxyCounts[mediaStreamTrack.id];

        if (proxies) {
          Object.values(proxies).forEach(proxy => proxy && proxy.destroy());
        }
      });

      logger.debug("Proxied audio monitor created", nativeMonitor);

      _monitorInstances[mediaStreamTrack.id] = nativeMonitor;
    }

    proxy._nativeMonitor = nativeMonitor;

    if (!_proxyCounts[mediaStreamTrack.id]) {
      // Start the count at one proxied instance
      _proxyCounts[mediaStreamTrack.id] = 1;
    } else {
      // Add to the count of proxied instances
      ++_proxyCounts[mediaStreamTrack.id];
    }

    /**
     * These events will be proxied from the native monitor to the proxy
     * monitor.
     *
     * @type {string[]}
     **/
    const proxyEvents = [
      EVT_AUDIO_LEVEL_UPDATED,
      EVT_AUDIO_SILENCE_STARTED,
      EVT_AUDIO_SILENCE_ENDED,
      EVT_DESTROYED,
    ];

    /** @type {{key: string, value: Function}} */
    const proxyHandlers = {};

    // Bind the proxy events, registering them with the handlers
    proxyEvents.forEach(proxyEvent => {
      proxyHandlers[proxyEvent] = data => proxy.emit(proxyEvent, data);

      nativeMonitor.on(proxyEvent, proxyHandlers[proxyEvent]);
    });

    // Handle proxy destruct
    proxy.registerShutdownHandler(async () => {
      // Unregister proxy events from the native monitor
      proxyEvents.forEach(proxyEvent =>
        nativeMonitor.off(proxyEvent, proxyHandlers[proxyEvent])
      );

      // Subtract from the count of proxied instances
      --_proxyCounts[mediaStreamTrack.id];

      // Destruct the monitor once all proxies are destructed
      if (!_proxyCounts[mediaStreamTrack.id]) {
        delete _monitorInstances[mediaStreamTrack.id];
        delete _proxyCounts[mediaStreamTrack.id];

        await nativeMonitor.destroy();

        logger.debug("Proxied audio monitor destroyed", nativeMonitor);
      }
    });
  }

  /**
   * @param {MediaStreamTrack} mediaStreamTrack
   */
  constructor(mediaStreamTrack) {
    NativeAudioMediaStreamTrackLevelMonitor.validateAudioTrack(
      mediaStreamTrack
    );

    super();

    this._mediaStreamTrack = mediaStreamTrack;

    this._nativeMonitor = null;

    // Bind this instance as a proxy to the native listener
    AudioMediaStreamTrackLevelMonitor.addProxyInstance(this);
  }

  /**
   * @return {MediaStreamTrack}
   */
  getMediaStreamTrack() {
    return this._mediaStreamTrack;
  }

  /**
   * @return {boolean}
   */
  getIsSilent() {
    return this._nativeMonitor.getIsSilent();
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    // Reset the audio level back to 0 so that any listeners to not stay
    // "stuck" on the last value
    this.emit(EVT_AUDIO_LEVEL_UPDATED, 0);

    return super.destroy();
  }
}

module.exports = AudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATED = EVT_AUDIO_LEVEL_UPDATED;
module.exports.EVT_AUDIO_SILENCE_STARTED = EVT_AUDIO_SILENCE_STARTED;
module.exports.EVT_AUDIO_SILENCE_ENDED = EVT_AUDIO_SILENCE_ENDED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
