const MultiAudioMediaStreamTrackLevelMonitor = require("./MultiAudioMediaStreamTrackLevelMonitor");
const {
  EVT_AUDIO_LEVEL_UPDATE,
  EVT_AUDIO_SILENCE_START,
  EVT_AUDIO_SILENCE_END,
} = MultiAudioMediaStreamTrackLevelMonitor;

module.exports = MultiAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATE = EVT_AUDIO_LEVEL_UPDATE;
module.exports.EVT_AUDIO_SILENCE_START = EVT_AUDIO_SILENCE_START;
module.exports.EVT_AUDIO_SILENCE_END = EVT_AUDIO_SILENCE_END;
