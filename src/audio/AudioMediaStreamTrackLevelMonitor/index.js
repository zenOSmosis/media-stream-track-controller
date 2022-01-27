// IMPORTANT: The proxy is exposed rather than the original monitor in order to
// reduce CPU load when multiple instances of the monitor are present at any
// given time
const AudioMediaStreamTrackLevelMonitor = require("./AudioMediaStreamTrackLevelMonitor");
const { EVT_DESTROYED, EVT_AUDIO_SILENCE_STARTED, EVT_AUDIO_SILENCE_ENDED } =
  AudioMediaStreamTrackLevelMonitor;

module.exports = AudioMediaStreamTrackLevelMonitor;

module.exports.EVT_DESTROYED = EVT_DESTROYED;
module.exports.EVT_AUDIO_SILENCE_STARTED = EVT_AUDIO_SILENCE_STARTED;
module.exports.EVT_AUDIO_SILENCE_ENDED = EVT_AUDIO_SILENCE_ENDED;
