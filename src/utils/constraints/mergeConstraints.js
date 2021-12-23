const { deepMerge } = require("phantom-core");

// TODO: Move into "constants" file
const AUDIO_DEVICE_KIND = "audio";
const VIDEO_DEVICE_KIND = "video";

/**
 * Deep merges, the given user constraints onto the default constraints, where
 * user constraints take precedence.
 *
 * The individual constraint types are first normalized, in order to provide
 * protection against mix of booleans and objects, multi-level intermediate
 * objects (improperly formed constraints), etc.
 *
 * @param {MediaTrackConstraints} defaultConstraints? [default = {}]
 * @param {MediaTrackConstraints} userConstraints? [default = {}]
 * @return {Object} // TODO: Document return object
 */
module.exports = function mergeConstraints(
  defaultConstraints = {},
  userConstraints = {}
) {
  const defaultAudioConstraints = normalizeConstraints(
    "audio",
    defaultConstraints && defaultConstraints.audio
  );
  const defaultVideoConstraints = normalizeConstraints(
    "video",
    defaultConstraints && defaultConstraints.video
  );

  const userAudioConstraints = normalizeConstraints(
    "audio",
    userConstraints && userConstraints.audio
  );
  const userVideoConstraints = normalizeConstraints(
    "video",
    userConstraints && userConstraints.video
  );

  const nextDefaultConstraints = deepMerge(
    defaultAudioConstraints,
    defaultVideoConstraints
  );

  const nextUserConstraints = deepMerge(
    userAudioConstraints,
    userVideoConstraints
  );

  const merged = deepMerge(nextDefaultConstraints, nextUserConstraints);

  return merged;
};

/**
 * Given the set of constraints of the given kind (audio or video), normalizes
 * the constraints with the kind as a sub-object and the constraints defined
 * within that sub-object, regardless if the sub-object was part of the
 * supplied constraints.
 *
 * IMPORTANT: This should be considered a "helper" utility and shouldn't
 * generally be utilized on its own.
 *
 * @param {"audio" | "video"} kind
 * @param {Object | boolean | null | undefined} userConstraints
 * @return {Object} // TODO: Document return object
 */
function normalizeConstraints(kind, userConstraints = {}) {
  if (kind !== AUDIO_DEVICE_KIND && kind !== VIDEO_DEVICE_KIND) {
    throw new TypeError("kind must be either audio or video");
  }

  if (
    typeof userConstraints !== "object" &&
    typeof userConstraints !== "boolean"
  ) {
    throw new TypeError(
      `userConstraints must be either an object or a boolean; received "${typeof userConstraints}" type`
    );
  }

  // Implement direct boolean pass-thru w/ base sub-object
  if (typeof userConstraints === "boolean") {
    return {
      [kind]: Boolean(userConstraints),
    };
  }

  // Allow userConstraints to be null
  if (userConstraints === null || userConstraints === undefined) {
    userConstraints = {};
  }

  if (userConstraints[kind] === undefined) {
    // Migrate existing user constraints to new object
    const prevUserConstraints = { ...userConstraints };

    userConstraints = {
      [kind]: prevUserConstraints,
    };
  } else if (userConstraints[kind][kind] !== undefined) {
    // Fix situations where doubled-up kind may be inadvertently passed via
    // userConstraints
    userConstraints[kind] = { ...userConstraints[kind][kind] };
  }

  // Return empty object if no constraints of the given kind
  if (!Object.keys(userConstraints[kind]).length) {
    return {};
  }

  return userConstraints;
}
