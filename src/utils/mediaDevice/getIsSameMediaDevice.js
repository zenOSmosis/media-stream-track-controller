const { MEDIA_DEVICE_KINDS } = require("../../constants");

/**
 * Determines whether the given media devices are the same.
 *
 * NOTE: One of these devices may represent partial data, such as one of them
 * only having a deviceId.
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

  const locDeviceA = { ...deviceA };
  const locDeviceB = { ...deviceB };

  if (enforcedKind) {
    if (!locDeviceA.kind && !locDeviceB.kind) {
      throw new ReferenceError(
        "At least one of the compared devices must have a reference kind"
      );
    }

    if (!locDeviceA.kind) {
      locDeviceA.kind = enforcedKind;
    }

    if (!locDeviceB.kind) {
      locDeviceB.kind = enforcedKind;
    }
  }

  if (!locDeviceA.kind || !locDeviceB.kind) {
    throw new ReferenceError(
      "partialKind must be specified if there are no available kinds"
    );
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
