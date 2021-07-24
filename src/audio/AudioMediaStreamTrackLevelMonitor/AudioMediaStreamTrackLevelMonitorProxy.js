const PhantomCore = require("phantom-core");
const { logger } = PhantomCore;
const AudioMediaStreamTrackLevelMonitor = require("./_AudioMediaStreamTrackLevelMonitor");
const {
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
  EVT_AUDIO_LEVEL_TICK,
  EVT_AUDIO_ERROR,
  EVT_AUDIO_ERROR_RECOVERED,
  EVT_DESTROYED,
} = AudioMediaStreamTrackLevelMonitor;

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
 * Exposed proxy for AudioMediaStreamTrackLevelMonitor.
 *
 * This class acts a one-to-many proxy between the monitor and any consumers on
 * top of it.  The goal of this class is to improve efficiency of duplicate
 * monitored MediaStreamTracks so their events can be utilized in more than one
 * place without reading the track multiple times.
 */
class AudioMediaStreamTrackLevelMonitorProxy extends PhantomCore {
  /**
   * Adds a proxy instance to the audio level monitor.
   *
   * If no audio level monitor the proxied MediaStreamTrack is present, it will
   * create the monitor.
   *
   * On proxy destruct, if no remaining proxies for the monitor are present, it
   * will destroy the audio level monitor.
   *
   * @param {AudioMediaStreamTrackLevelMonitorProxy} proxy
   * @return {void}
   */
  static addProxyInstance(proxy) {
    const mediaStreamTrack = proxy.getMediaStreamTrack();

    let monitor = _monitorInstances[mediaStreamTrack.id];

    if (!monitor) {
      monitor = new AudioMediaStreamTrackLevelMonitor(mediaStreamTrack);

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
    AudioMediaStreamTrackLevelMonitor.validateAudioTrack(mediaStreamTrack);

    super();

    this._mediaStreamTrack = mediaStreamTrack;

    AudioMediaStreamTrackLevelMonitorProxy.addProxyInstance(this);
  }

  /**
   * @return {MediaStreamTrack}
   */
  getMediaStreamTrack() {
    return this._mediaStreamTrack;
  }
}

module.exports = AudioMediaStreamTrackLevelMonitorProxy;
module.exports.EVT_AVERAGE_AUDIO_LEVEL_CHANGED =
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED;
module.exports.EVT_AUDIO_LEVEL_TICK = EVT_AUDIO_LEVEL_TICK;
module.exports.EVT_AUDIO_ERROR = EVT_AUDIO_ERROR;
module.exports.EVT_AUDIO_ERROR_RECOVERED = EVT_AUDIO_ERROR_RECOVERED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
