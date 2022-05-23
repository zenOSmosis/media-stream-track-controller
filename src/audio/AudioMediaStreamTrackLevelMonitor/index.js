// IMPORTANT: The proxy is exposed rather than the original monitor in order to
// reduce CPU load when multiple instances of the monitor are present at any
// given time
const AudioMediaStreamTrackLevelMonitor = require("./AudioMediaStreamTrackLevelMonitor");
const { EVT_DESTROY, EVT_AUDIO_SILENCE_START, EVT_AUDIO_SILENCE_END } =
  AudioMediaStreamTrackLevelMonitor;

module.exports = AudioMediaStreamTrackLevelMonitor;

module.exports.EVT_DESTROY = EVT_DESTROY;
module.exports.EVT_AUDIO_SILENCE_START = EVT_AUDIO_SILENCE_START;
module.exports.EVT_AUDIO_SILENCE_END = EVT_AUDIO_SILENCE_END;
