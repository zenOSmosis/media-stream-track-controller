const audioQualityPresets = require("./audioQualityPresets");
const constraints = require("./constraints");
const captureMediaDevice = require("./captureMediaDevice");
const captureScreen = require("./captureScreen");
const { getIsScreenCaptureSupported } = captureScreen;
const fetchMediaDevices = require("./fetchMediaDevices");
const { fetchInputMediaDevices } = fetchMediaDevices;
const mediaDeviceInfoFilters = require("./mediaDeviceInfoFilters");
const {
  getNewAudioContext,
  getSharedAudioContext,
  untilAudioContextResumed,
} = require("./getAudioContext");
const getMatchedMediaDevice = require("./getMatchedMediaDevice");
const stopMediaStream = require("./stopMediaStream");
const getMediaStreamTrackControllerInstances = require("./getMediaStreamTrackControllerInstances");

module.exports = {
  audioQualityPresets,
  constraints,
  captureMediaDevice,
  captureScreen,
  getIsScreenCaptureSupported,
  fetchMediaDevices,
  fetchInputMediaDevices,
  mediaDeviceInfoFilters,
  getNewAudioContext,
  getSharedAudioContext,
  untilAudioContextResumed,
  getMatchedMediaDevice,
  stopMediaStream,
  getMediaStreamTrackControllerInstances,
};
