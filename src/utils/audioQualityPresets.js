/** @export */
const AUDIO_QUALITY_PRESET_TALK_RADIO = {
  name: "Talk Radio",
  constraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      sampleSize: 16,
    },
  },
};

/** @export */
const AUDIO_QUALITY_PRESET_MUSIC_LOW_QUALITY = {
  name: "Music - Low Quality",
  constraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      sampleSize: 16,
    },
  },
};

/** @export */
const AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY = {
  name: "Music - High Quality",
  constraints: {
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      sampleSize: 16,
    },
  },
};

module.exports = [
  AUDIO_QUALITY_PRESET_TALK_RADIO,
  AUDIO_QUALITY_PRESET_MUSIC_LOW_QUALITY,
  AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY,
];

module.exports.AUDIO_QUALITY_PRESET_TALK_RADIO =
  AUDIO_QUALITY_PRESET_TALK_RADIO;

module.exports.AUDIO_QUALITY_PRESET_MUSIC_LOW_QUALITY =
  AUDIO_QUALITY_PRESET_MUSIC_LOW_QUALITY;

module.exports.AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY =
  AUDIO_QUALITY_PRESET_MUSIC_HIGH_QUALITY;

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
