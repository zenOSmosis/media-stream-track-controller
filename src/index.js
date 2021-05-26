const {
  EVT_READY,
  EVT_UPDATED,
  EVT_DESTROYED,
} = require("./_MediaStreamTrackControllerBase");
const AudioMediaStreamTrackController = require("./audio/AudioMediaStreamTrackController");
const VideoMediaStreamTrackController = require("./video/VideoMediaStreamTrackController");
const MediaStreamTrackControllerFactory = require("./MediaStreamTrackControllerFactory");
const utils = require("./utils");
const debug = require("./debug");
const MediaStreamTrackAudioLevelMonitor = require("./audio/MediaStreamTrackAudioLevelMonitor");
const {
  EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
  EVT_AUDIO_LEVEL_TICK,
  EVT_AUDIO_ERROR,
  EVT_AUDIO_ERROR_RECOVERED,
} = MediaStreamTrackAudioLevelMonitor;

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
  MediaStreamTrackAudioLevelMonitor,
  MediaStreamTrackAudioLevelMonitorEvents: {
    EVT_DESTROYED,
    EVT_AVERAGE_AUDIO_LEVEL_CHANGED,
    EVT_AUDIO_LEVEL_TICK,
    EVT_AUDIO_ERROR,
    EVT_AUDIO_ERROR_RECOVERED,
  },
};
