const PhantomCore = require("phantom-core");
const { logger } = PhantomCore;
const NativeAudioMediaStreamTrackLevelMonitor = require("./NativeAudioMediaStreamTrackLevelMonitor");
const {
  /** @exports */
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
  /** @exports */
  EVT_AUDIO_LEVEL_TICK,
  /** @exports */
  EVT_AUDIO_ERROR,
  /** @exports */
  EVT_AUDIO_ERROR_RECOVERED,
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
 * @type {{key: string, value: number}}
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
    const mediaStreamTrack = proxy.getMediaStreamTrack();

    let monitor = _monitorInstances[mediaStreamTrack.id];

    if (!monitor) {
      monitor = new NativeAudioMediaStreamTrackLevelMonitor(mediaStreamTrack);

      // Handle monitor destroy
      //
      // Remove all proxies for the given audio level monitor
      monitor.once(EVT_DESTROYED, () => {
        const proxies = _proxyCounts[mediaStreamTrack.id];

        if (proxies) {
          Object.values(proxies).forEach(proxy => proxy && proxy.destroy());
        }
      });

      _monitorInstances[mediaStreamTrack.id] = monitor;

      logger.debug("Proxied audio monitor created", monitor);
    }

    if (!_proxyCounts[mediaStreamTrack.id]) {
      // Start the count at one proxied instance
      _proxyCounts[mediaStreamTrack.id] = 1;
    } else {
      // Add to the count of proxied instances
      ++_proxyCounts[mediaStreamTrack.id];
    }

    /** @type {string[]} */
    const proxyEvents = [
      EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
      EVT_AUDIO_LEVEL_TICK,
      EVT_AUDIO_ERROR,
      EVT_AUDIO_ERROR_RECOVERED,
      EVT_DESTROYED,
    ];

    // Keyed with event names
    const proxyHandlers = {};

    proxyEvents.forEach(proxyEvent => {
      proxyHandlers[proxyEvent] = data => proxy.emit(proxyEvent, data);

      monitor.on(proxyEvent, proxyHandlers[proxyEvent]);
    });

    // Handle proxy destroy
    //
    // If no remaining proxies, destroy the audio level monitor
    proxy.once(EVT_DESTROYED, async () => {
      proxyEvents.forEach(proxyEvent =>
        monitor.off(proxyEvent, proxyHandlers[proxyEvent])
      );

      // Subtract from the count of proxied instances
      --_proxyCounts[mediaStreamTrack.id];

      // Destroy the monitor if all proxies are destroyed
      if (!_proxyCounts[mediaStreamTrack.id]) {
        delete _monitorInstances[mediaStreamTrack.id];
        delete _proxyCounts[mediaStreamTrack.id];

        await monitor.destroy();

        logger.debug("Proxied audio monitor destroyed", monitor);
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

    AudioMediaStreamTrackLevelMonitor.addProxyInstance(this);
  }

  /**
   * @return {MediaStreamTrack}
   */
  getMediaStreamTrack() {
    return this._mediaStreamTrack;
  }
}

module.exports = AudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AVERAGE_AUDIO_LEVEL_CHANGED =
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED;
module.exports.EVT_AUDIO_LEVEL_TICK = EVT_AUDIO_LEVEL_TICK;
module.exports.EVT_AUDIO_ERROR = EVT_AUDIO_ERROR;
module.exports.EVT_AUDIO_ERROR_RECOVERED = EVT_AUDIO_ERROR_RECOVERED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
