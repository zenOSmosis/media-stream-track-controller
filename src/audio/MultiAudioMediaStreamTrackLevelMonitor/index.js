const MultiAudioMediaStreamTrackLevelMonitor = require("./MultiAudioMediaStreamTrackLevelMonitor");
const {
  EVT_AUDIO_LEVEL_UPDATED,
  EVT_AUDIO_SILENCE_STARTED,
  EVT_AUDIO_SILENCE_ENDED,
} = MultiAudioMediaStreamTrackLevelMonitor;

module.exports = MultiAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATED = EVT_AUDIO_LEVEL_UPDATED;
module.exports.EVT_AUDIO_SILENCE_STARTED = EVT_AUDIO_SILENCE_STARTED;
module.exports.EVT_AUDIO_SILENCE_ENDED = EVT_AUDIO_SILENCE_ENDED;
