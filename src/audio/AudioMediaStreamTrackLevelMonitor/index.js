// IMPORTANT: The proxy is exposed rather than the original monitor in order to
// reduce CPU load when multiple instances of the monitor are present at any
// given time
const AudioMediaStreamTrackLevelMonitor = require("./AudioMediaStreamTrackLevelMonitor");
const { EVT_DESTROYED, EVT_AUDIO_SILENCE, EVT_AUDIO_SILENCE_END } =
  AudioMediaStreamTrackLevelMonitor;

module.exports = AudioMediaStreamTrackLevelMonitor;

module.exports.EVT_DESTROYED = EVT_DESTROYED;
module.exports.EVT_AUDIO_SILENCE = EVT_AUDIO_SILENCE;
module.exports.EVT_AUDIO_SILENCE_END = EVT_AUDIO_SILENCE_END;
