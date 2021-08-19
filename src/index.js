const {
  EVT_READY,
  EVT_UPDATED,
  EVT_DESTROYED,
} = require("./_base/_MediaStreamTrackControllerBase");
const AudioMediaStreamTrackController = require("./audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("./video/VideoMediaStreamTrackController");
const MediaStreamTrackControllerFactory = require("./MediaStreamTrackControllerFactory");
const utils = require("./utils");
const debug = require("./debug");
const AudioMediaStreamTrackLevelMonitor = require("./audio/AudioMediaStreamTrackLevelMonitor");
const {
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
  EVT_AUDIO_LEVEL_TICK,
  EVT_AUDIO_ERROR,
  EVT_AUDIO_ERROR_RECOVERED,
} = AudioMediaStreamTrackLevelMonitor;
const MultiAudioMediaStreamTrackLevelMonitor = require("./audio/MultiAudioMediaStreamTrackLevelMonitor");
const { EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK } =
  MultiAudioMediaStreamTrackLevelMonitor;

module.exports = {
  AudioMediaStreamTrackController,
  VideoMediaStreamTrackController,
  MediaStreamTrackControllerEvents: {
    EVT_READY,
    EVT_UPDATED,
    EVT_DESTROYED,
  },
  MediaStreamTrackControllerFactory,
  utils,
  debug,
  AudioMediaStreamTrackLevelMonitor,
  AudioMediaStreamTrackLevelMonitorEvents: {
    EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
    EVT_AUDIO_LEVEL_TICK,
    EVT_AUDIO_ERROR,
    EVT_AUDIO_ERROR_RECOVERED,
    EVT_DESTROYED,
  },
  MultiAudioMediaStreamTrackLevelMonitor,
  MultiAudioMediaStreamTrackLevelMonitorEvents: {
    EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
    EVT_AUDIO_LEVEL_TICK,
    EVT_AUDIO_ERROR,
    EVT_AUDIO_ERROR_RECOVERED,
    EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK,
    EVT_DESTROYED,
  },
};
