const {
  EVT_READY,
  EVT_UPDATED,
  EVT_DESTROYED,
} = require("./_base/_MediaStreamTrackControllerBase");
const AudioMediaStreamTrackController = require("./audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("./video/VideoMediaStreamTrackController");
const MediaStreamTrackControllerFactory = require("./MediaStreamTrackControllerFactory");
const MediaStreamTrackControllerCollection = require("./MediaStreamTrackControllerCollection");
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
  MediaStreamTrackControllerCollection,
  utils,
  debug,
  AudioMediaStreamTrackLevelMonitor,

  // FIXME: Remove; just obtain from the individual module itself
  AudioMediaStreamTrackLevelMonitorEvents: {
    EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
    EVT_AUDIO_LEVEL_TICK,
    EVT_AUDIO_ERROR,
    EVT_AUDIO_ERROR_RECOVERED,
    EVT_DESTROYED,
  },
  MultiAudioMediaStreamTrackLevelMonitor,

  // FIXME: Remove; just obtain from the individual module itself
  MultiAudioMediaStreamTrackLevelMonitorEvents: {
    EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
    EVT_AUDIO_LEVEL_TICK,
    EVT_AUDIO_ERROR,
    EVT_AUDIO_ERROR_RECOVERED,
    EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK,
    EVT_DESTROYED,
  },
};
