const MediaStreamTrackAudioLevelMonitorProxy = require("./MediaStreamTrackAudioLevelMonitorProxy");
const {
  EVT_DESTROYED,
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
  EVT_AUDIO_LEVEL_TICK,
  EVT_AUDIO_ERROR,
  EVT_AUDIO_ERROR_RECOVERED,
} = MediaStreamTrackAudioLevelMonitorProxy;

module.exports = MediaStreamTrackAudioLevelMonitorProxy;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
module.exports.EVT_AVERAGE_AUDIO_LEVEL_CHANGED = EVT_AVERAGE_AUDIO_LEVEL_CHANGED;
module.exports.EVT_AUDIO_LEVEL_TICK = EVT_AUDIO_LEVEL_TICK;
module.exports.EVT_AUDIO_ERROR = EVT_AUDIO_ERROR;
module.exports.EVT_AUDIO_ERROR_RECOVERED = EVT_AUDIO_ERROR_RECOVERED;
