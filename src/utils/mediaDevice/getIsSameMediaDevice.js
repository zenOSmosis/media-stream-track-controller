const { MEDIA_DEVICE_KINDS } = require("../../constants");
const { logger } = require("phantom-core");

/**
 * Determines whether the given media devices are the same.
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

  // Shallow copy devices so we can alter their properties, if need-be
  const locDeviceA = { ...deviceA };
  const locDeviceB = { ...deviceB };

  if (enforcedKind) {
    // If neither device has a kind associated to it, return false
    if (!locDeviceA.kind && !locDeviceB.kind) {
      return false;
    }

    // Patch deviceA kind if previously non-existent, patch it with the
    // enforcedKind
    if (!locDeviceA.kind) {
      locDeviceA.kind = enforcedKind;
    }

    // Patch deviceB kind if previously non-existent, patch it with the
    // enforcedKind
    if (!locDeviceB.kind) {
      locDeviceB.kind = enforcedKind;
    }
  }

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
