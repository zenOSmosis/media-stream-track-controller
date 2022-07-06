const { PhantomCore, globalLogger } = require("phantom-core");
const NativeAudioMediaStreamTrackLevelMonitor = require("./NativeAudioMediaStreamTrackLevelMonitor");
const {
  /** @export */
  EVT_AUDIO_LEVEL_UPDATE,
  /** @export */
  EVT_AUDIO_SILENCE_START,
  /** @export */
  EVT_AUDIO_SILENCE_END,
  /** @export */
  EVT_DESTROY,
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
      nativeMonitor.once(EVT_DESTROY, () => {
        const proxies = _proxyCounts[mediaStreamTrack.id];

        if (proxies) {
          Object.values(proxies).forEach(
            proxy => proxy && !proxy.getHasDestroyStarted() && proxy.destroy()
          );
        }
      });

      globalLogger.debug("Proxied audio monitor created", nativeMonitor);

      _monitorInstances[mediaStreamTrack.id] = nativeMonitor;
    }

    // Register the native monitor with the proxy
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
      EVT_AUDIO_LEVEL_UPDATE,
      EVT_AUDIO_SILENCE_START,
      EVT_AUDIO_SILENCE_END,
    ];

    /** @type {{key: string, value: Function}} */
    const proxyHandlers = {};

    // Bind the proxy events, registering them with the handlers
    proxyEvents.forEach(proxyEvent => {
      proxyHandlers[proxyEvent] = data => proxy.emit(proxyEvent, data);

      nativeMonitor.on(proxyEvent, proxyHandlers[proxyEvent]);
    });

    // Handle proxy destruct
    proxy.once(EVT_DESTROY, async () => {
      // Unregister proxy events from the native monitor (any new audio levels
      // won't come through at this point)
      proxyEvents.forEach(proxyEvent =>
        nativeMonitor.off(proxyEvent, proxyHandlers[proxyEvent])
      );

      // Emit final audio level updated event
      proxy.emit(EVT_AUDIO_LEVEL_UPDATE, 0);

      // Subtract from the count of proxied instances
      --_proxyCounts[mediaStreamTrack.id];

      // Destruct the monitor once all proxies are destructed
      if (!_proxyCounts[mediaStreamTrack.id]) {
        delete _monitorInstances[mediaStreamTrack.id];
        delete _proxyCounts[mediaStreamTrack.id];

        if (!nativeMonitor.getHasDestroyStarted()) {
          await nativeMonitor.destroy();
        }

        globalLogger.debug("Proxied audio monitor destroyed", nativeMonitor);
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

    // IMPORTANT: Don't destruct the native monitor here on shutdown because
    // the native monitor might be utilized across multiple proxy instances,
    // just unregister it as a class property so that "lingering PhantomCore
    // instance" warning does not appear
    this.registerCleanupHandler(() => (this._nativeMonitor = null));

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
}

module.exports = AudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATE = EVT_AUDIO_LEVEL_UPDATE;
module.exports.EVT_AUDIO_SILENCE_START = EVT_AUDIO_SILENCE_START;
module.exports.EVT_AUDIO_SILENCE_END = EVT_AUDIO_SILENCE_END;
module.exports.EVT_DESTROY = EVT_DESTROY;
