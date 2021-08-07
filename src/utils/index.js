const constraints = require("./constraints");
const captureMediaDevice = require("./captureMediaDevice");
const captureScreen = require("./captureScreen");
const { getIsScreenCaptureSupported } = captureScreen;
const fetchMediaDevices = require("./fetchMediaDevices");
const {
  getNewAudioContext,
  getSharedAudioContext,
  untilAudioContextResumed,
} = require("./getAudioContext");
const getMediaDeviceMatch = require("./getMediaDeviceMatch");
const stopMediaStream = require("./stopMediaStream");
const getMediaStreamTrackControllerInstances = require("./getMediaStreamTrackControllerInstances");

module.exports = {
  constraints,
  captureMediaDevice,
  captureScreen,
  getIsScreenCaptureSupported,
  fetchMediaDevices,
  getNewAudioContext,
  getSharedAudioContext,
  untilAudioContextResumed,
  getMediaDeviceMatch,
  stopMediaStream,
  getMediaStreamTrackControllerInstances,
};
