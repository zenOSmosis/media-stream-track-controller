/** @export */
const AUDIO_QUALITY_PRESET_TALK_RADIO = {
  name: "Talk Radio",
  constraints: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    // FIXME: (jh) Configure sampleRate / sampleSize?
    sampleRate: 48000,
    sampleSize: 16,
    // Mono
    channelCount: 1,
  },
};

/** @export */
const AUDIO_QUALITY_PRESET_MUSIC_LOW_QUALITY = {
  name: "Music - Low Quality",
  constraints: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    // FIXME: (jh) Configure sampleRate / sampleSize?
    sampleRate: 48000,
    sampleSize: 16,
    // Mono
    channelCount: 1,
  },
};

/** @export */
const AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY = {
  name: "Music - High Quality",
  constraints: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    sampleRate: 48000,
    sampleSize: 16,
    // Stereo
    channelCount: 2,
  },
};

/** @export */
const audioQualityPresets = [
  AUDIO_QUALITY_PRESET_TALK_RADIO,
  AUDIO_QUALITY_PRESET_MUSIC_LOW_QUALITY,
  AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY,
];

module.exports = audioQualityPresets;

module.exports.AUDIO_QUALITY_PRESET_TALK_RADIO =
  AUDIO_QUALITY_PRESET_TALK_RADIO;

module.exports.AUDIO_QUALITY_PRESET_MUSIC_LOW_QUALITY =
  AUDIO_QUALITY_PRESET_MUSIC_LOW_QUALITY;

module.exports.AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY =
  AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY;

/**
 * Retrieves the associated audio quality preset with the given name.
 *
 * @param {string} name
 * @return {Object | void}
 */
module.exports.getAudioQualityPresetWithName = name =>
  audioQualityPresets.find(({ name: presetName }) => name === presetName);

/**
 * Retrieves the constraints associated with the given audio quality preset.
 *
 * @param {Object} audioQualityPreset
 * @return {Object | void}
 */
module.exports.getAudioQualityPresetConstraints = (
  audioQualityPreset = AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY
) => {
  return audioQualityPreset?.constraints;
};

// TODO: Document
module.exports.getMatchedAudioQualityPreset = trackSettings => {
  const matchProps = [
    "echoCancellation",
    "noiseSuppression",
    "autoGainControl",
    "channelCount",

    // NOTE: Sample rate and sample size may be dynamically altered by the
    // hardware, so they are not reliable to match against
  ];

  return audioQualityPresets.find(preset =>
    matchProps.every(prop => preset.constraints[prop] === trackSettings[prop])
  );
};
