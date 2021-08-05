const constraints = require("./constraints");
const captureDeviceMedia = require("./captureDeviceMedia");
const captureScreen = require("./captureScreen");
const { getIsScreenCaptureSupported } = captureScreen;
const fetchMediaDevices = require("./fetchMediaDevices");
const {
  getNewAudioContext,
  getSharedAudioContext,
  untilAudioContextResumed,
} = require("./getAudioContext");
// const splitMediaStream = require('./splitMediaStream')
const stopMediaStream = require("./stopMediaStream");
const getMediaStreamTrackControllerInstances = require("./getMediaStreamTrackControllerInstances");

module.exports = {
  constraints,
  captureDeviceMedia,
  captureScreen,
  getIsScreenCaptureSupported,
  fetchMediaDevices,
  getNewAudioContext,
  getSharedAudioContext,
  untilAudioContextResumed,
  // splitMediaStream,
  stopMediaStream,
  getMediaStreamTrackControllerInstances,
};
