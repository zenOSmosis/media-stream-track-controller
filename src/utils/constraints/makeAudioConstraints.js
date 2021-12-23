const mergeConstraints = require("./mergeConstraints");

const {
  getAudioQualityPresetConstraints,
  AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY,
} = require("./audioQualityPresets");

/**
 * Form audio capture constraints, merging optional user constraints onto
 * internal default constraints.
 *
 * @param {MediaTrackConstraints | Object} userConstraints? [default = {}]
 * @return {MediaTrackConstraints | Object}
 */
module.exports = function makeAudioConstraints(userConstraints = {}) {
  const DEFAULT_AUDIO_CONSTRAINTS = getAudioQualityPresetConstraints(
    AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY
  );

  return mergeConstraints(DEFAULT_AUDIO_CONSTRAINTS, userConstraints);
};
