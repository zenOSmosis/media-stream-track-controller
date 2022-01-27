const MultiAudioMediaStreamTrackLevelMonitor = require("./MultiAudioMediaStreamTrackLevelMonitor");
const { EVT_AUDIO_LEVEL_UPDATED, EVT_AUDIO_SILENCE, EVT_AUDIO_SILENCE_END } =
  MultiAudioMediaStreamTrackLevelMonitor;

module.exports = MultiAudioMediaStreamTrackLevelMonitor;

module.exports.EVT_AUDIO_LEVEL_UPDATED = EVT_AUDIO_LEVEL_UPDATED;
module.exports.EVT_AUDIO_SILENCE = EVT_AUDIO_SILENCE;
module.exports.EVT_AUDIO_SILENCE_END = EVT_AUDIO_SILENCE_END;
