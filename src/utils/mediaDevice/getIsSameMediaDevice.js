const { MEDIA_DEVICE_KINDS } = require("../../constants");

/**
 * Determines whether the given media devices are the same, despite if their
 * object references are different.
 *
 * This includes the ability to determine if MediaDeviceInfo matches an object
 * with MediaDeviceInfo-like properties.
 *
 * NOTE: One of these devices may represent partial data, such as one of them
 * only having a deviceId. It is in hopes that the object would not be run
 * through this comparison algorithm if the type was never known, however, as a
 * fallback, the enforcedKind will add additional checking.
 *
 * @param {MediaDeviceInfo | Object} deviceA Partial, or complete data
 * representation of the device
 * @param {MediaDeviceInfo | Object} deviceB Partial, or complete data
 * representation of the device
 * @param {string} enforcedKind? [default = null] Utilized for augmentation of
 * device info should one of the devices be missing this type
 * @return {boolean}
 */
module.exports = function getIsSameMediaDevice(
  deviceA,
  deviceB,
  enforcedKind = null
) {
  if (enforcedKind && !MEDIA_DEVICE_KINDS.includes(enforcedKind)) {
    throw new ReferenceError(`Invalid enforcedKind "${enforcedKind}`);
  }

  if (typeof deviceA !== "object" || typeof deviceB !== "object") {
    throw new TypeError("deviceA and deviceB must be objects");
  }

  // Obtain copies of the devices so that we can potentially add properties to
  // them without affecting their source reference
  const [locDeviceA, locDeviceB] = [deviceA, deviceB].map(device => {
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
  });

  if (enforcedKind) {
    // If neither device has a kind associated to it, return false
    if (!locDeviceA.kind && !locDeviceB.kind) {
      return false;
    }

    // "Conditional patch logic" follows; if either one of the devices does not
    // have an associated kind attached to it, add the property
    [locDeviceA, locDeviceB].forEach(device => {
      if (!device.kind) {
        device.kind = enforcedKind;
      }
    });
  }

  // If either device still doesn't have an associated kind after conditional
  // patch logic above, return false
  if (!locDeviceA.kind || !locDeviceB.kind) {
    return false;
  } else if (!MEDIA_DEVICE_KINDS.includes(locDeviceA.kind)) {
    throw new ReferenceError(`Invalid kind for deviceA "${locDeviceA.kind}"`);
  } else if (!MEDIA_DEVICE_KINDS.includes(locDeviceB.kind)) {
    throw new ReferenceError(`Invalid kind for deviceB "${locDeviceB.kind}"`);
  } else if (
    enforcedKind &&
    // Ensure both devices match the enforcedKind
    (locDeviceA.kind !== enforcedKind || locDeviceB.kind !== enforcedKind)
  ) {
    return false;
  }

  if (
    // Best match
    locDeviceA.kind === locDeviceB.kind &&
    (locDeviceA.deviceId !== undefined || locDeviceB.deviceId !== undefined) &&
    locDeviceA.deviceId === locDeviceB.deviceId
  ) {
    return true;
  } else if (
    // Fallback match
    locDeviceA.kind === locDeviceB.kind &&
    (locDeviceA.label !== undefined || locDeviceB.label !== undefined) &&
    locDeviceA.label === locDeviceB.label
  ) {
    return true;
  } else {
    // No match
    return false;
  }
};
