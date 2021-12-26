module.exports.MEDIA_DEVICE_KINDS = [
  "audioinput",
  "videoinput",
  "audiooutput",
  "videooutput",
];

module.exports.AUDIO_TRACK_KIND = "audio";
module.exports.VIDEO_TRACK_KIND = "video";

/**
 * A/V device kinds w/o input / output designations.
 *
 * These types aren't officially recognized by the browser as a device kind
 * (they will be *input/*output, however this package uses them for
 * identification purposes).
 **/
module.exports.GENERIC_AUDIO_DEVICE_KIND = "audio";
module.exports.GENERIC_VIDEO_DEVICE_KIND = "video";

module.exports.GENERIC_INPUT_DEVICE_KIND = "input";
module.exports.GENERIC_OUTPUT_DEVICE_KIND = "output";
