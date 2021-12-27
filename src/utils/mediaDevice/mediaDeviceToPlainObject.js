const { logger } = require("phantom-core");

/**
 * Converts a MediaDeviceInfo object into a plain object.
 *
 * @param {MediaDeviceInfo | Object} device
 * @return {Object}
 */
module.exports = function mediaDeviceToPlainObject(device) {
  // IMPORTANT: I (jh) experimented with several attempts to iterate over a
  // combination of MediaDeviceInfo and regular objects, and was having
  // trouble getting tests to run in SauceLabs environment.
  //
  // Apparently MediaDeviceInfo cannot be iterated on with {...device}, nor
  // is it apparently available in non-SSL environments, which I believe is
  // the case that some of these tests are running in.
  try {
    if (
      typeof window.MediaDeviceInfo !== undefined &&
      device instanceof window.MediaDeviceInfo &&
      typeof device.toJSON === "function"
    ) {
      return device.toJSON();
    } else {
      return { ...device };
    }
  } catch (err) {
    logger.error(err);
  }
};
