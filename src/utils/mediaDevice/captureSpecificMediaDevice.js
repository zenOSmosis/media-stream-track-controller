const MediaStreamTrackControllerFactory = require("../../MediaStreamTrackControllerFactory");
const captureMediaDevice = require("./captureMediaDevice");
const makeSpecificDeviceCaptureConstraints = require("../constraints/makeSpecificDeviceCaptureConstraints");

/**
 * Captures audio from the specific audio input device with the given
 * mediaDeviceId.
 *
 * @param {MediaDeviceInfo | Object} mediaDeviceInfo The media device info of the device to capture. @see fetchMediaDevices
 * @param {MediaTrackConstraints} userConstraints? [optional; default = {}]
 * @param {Object} factoryOptions? [optional; default = {}]
 * @return {Promise<MediaStreamTrackControllerFactory>}
 */
module.exports = async function captureSpecificMediaDevice(
  mediaDeviceInfo,
  userConstraints = {},
  factoryOptions = {}
) {
  const nextConstraints = makeSpecificDeviceCaptureConstraints(
    mediaDeviceInfo,
    userConstraints
  );

  return captureMediaDevice(nextConstraints, factoryOptions);
};
