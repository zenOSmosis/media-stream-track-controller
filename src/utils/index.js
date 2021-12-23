module.exports = {
  audioContext: {
    getNewAudioContext: require("./audioContext/getNewAudioContext"),
    getSharedAudioContext: require("./audioContext/getSharedAudioContext"),
    untilAudioContextResumed: require("./audioContext/untilAudioContextResumed"),
  },
  constraints: {
    audioQualityPresets: require("./constraints/audioQualityPresets"),
    makeAudioConstraints: require("./constraints/makeAudioConstraints"),
    makeScreenCaptureConstraints: require("./constraints/makeScreenCaptureConstraints"),
    makeSpecificDeviceCaptureConstraints: require("./constraints/makeSpecificDeviceCaptureConstraints"),
    makeVideoConstraints: require("./constraints/makeVideoConstraints"),
    mergeConstraints: require("./constraints/mergeConstraints"),
  },
  mediaDevice: {
    mediaDeviceInfoFilters: {
      filterAudioInputDevices: require("./mediaDevice/mediaDeviceInfoFilters/filterAudioInputDevices"),
      filterAudioOutputDevices: require("./mediaDevice/mediaDeviceInfoFilters/filterAudioOutputDevices"),
      filterInputMediaDevices: require("./mediaDevice/mediaDeviceInfoFilters/filterInputMediaDevices"),
      filterOutputMediaDevices: require("./mediaDevice/mediaDeviceInfoFilters/filterOutputMediaDevices"),
      filterVideoInputDevices: require("./mediaDevice/mediaDeviceInfoFilters/filterVideoInputDevices"),
      filterVideoOutputDevices: require("./mediaDevice/mediaDeviceInfoFilters/filterVideoOutputDevices"),
    },
    cacheDiffMediaDevices: require("./mediaDevice/cacheDiffMediaDevices"),
    captureMediaDevice: require("./mediaDevice/captureMediaDevice"),
    captureSpecificMediaDevice: require("./mediaDevice/captureSpecificMediaDevice"),
    fetchInputMediaDevices: require("./mediaDevice/fetchInputMediaDevices"),
    fetchMediaDevices: require("./mediaDevice/fetchMediaDevices"),
    getIsMediaDeviceBeingCaptured: require("./mediaDevice/getIsMediaDeviceBeingCaptured"),
    getIsMediaDeviceCaptureSupported: require("./mediaDevice/getIsMediaDeviceCaptureSupported"),
    getMatchedMediaDevice: require("./mediaDevice/getMatchedMediaDevice"),
    getMediaDeviceTrackControllers: require("./mediaDevice/getMediaDeviceTrackControllers"),
    uncaptureSpecificMediaDevice: require("./mediaDevice/uncaptureSpecificMediaDevice"),
  },
  mediaStream: {
    generators: {
      createEmptyAudioMediaStream: require("./mediaStream/generators/createEmptyAudioMediaStream"),
      createTestAudioMediaStream: require("./mediaStream/generators/createTestAudioMediaStream"),
      createTestVideoMediaStream: require("./mediaStream/generators/createTestVideoMediaStream"),
    },
    getMediaStreamTrackControllerInstance: require("./mediaStream/getMediaStreamTrackControllerInstances"),
    stopMediaStream: require("./mediaStream/stopMediaStream"),
  },
  screen: {
    captureScreen: require("./screen/captureScreen"),
    getIsScreenCaptureSupported: require("./screen/getIsScreenCaptureSupported"),
  },
};
