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
  const ret = {};
  for (const prop in device) {
    ret[prop] = device[prop];
  }
  return ret;
};
