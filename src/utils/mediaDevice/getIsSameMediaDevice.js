const { MEDIA_DEVICE_KINDS } = require("../../constants");

// TODO: Document
/**
 * @param {MediaDeviceInfo | Object} deviceA
 * @param {MediaDeviceInfo | Object} device
 * @param {string} enforcedKind? [default = null]
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
    (locDeviceA.kind !== enforcedKind || locDeviceB.kind !== enforcedKind)
  ) {
    return false;
  }

  if (
    // Best match
    locDeviceA.kind === locDeviceB.kind &&
    locDeviceA &&
    (locDeviceA.deviceId !== undefined || locDeviceB.deviceId !== undefined) &&
    locDeviceA.deviceId === locDeviceB.deviceId
  ) {
    return true;
  } else if (
    // Fallback match
    locDeviceA.kind === locDeviceB.kind &&
    locDeviceA &&
    (locDeviceA.label !== undefined || locDeviceB.label !== undefined) &&
    locDeviceA.label === locDeviceB.label
  ) {
    return true;
  } else {
    // No match
    return false;
  }
};
