const MultiAudioMediaStreamTrackLevelMonitor = require("./MultiAudioMediaStreamTrackLevelMonitor");
const {
  EVT_AUDIO_LEVEL_UPDATED,
  EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK,
  EVT_AUDIO_ERROR,
  EVT_AUDIO_ERROR_RECOVERED,
} = MultiAudioMediaStreamTrackLevelMonitor;

module.exports = MultiAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATED = EVT_AUDIO_LEVEL_UPDATED;
module.exports.EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK =
  EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK;
module.exports.EVT_AUDIO_ERROR = EVT_AUDIO_ERROR;
module.exports.EVT_AUDIO_ERROR_RECOVERED = EVT_AUDIO_ERROR_RECOVERED;
