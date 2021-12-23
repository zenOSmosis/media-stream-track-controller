const { getNewAudioContext, stopMediaStream } = require("../utils");
const { logger } = require("phantom-core");

/**
 * Returns a MediaStream with a single pulsing, test audio track which
 * automatically ends at the specified duration.
 *
 * @param {number} duration? [default = 5] Number of seconds the pulse should
 * last.
 * @return {MediaStream}
 */
module.exports = function createTestAudioMediaStream(duration = 5) {
  const pulseHz = 880;
  const lfoHz = 30;

  const audioCtx = getNewAudioContext();

  let osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(pulseHz, audioCtx.currentTime);

  let amp = audioCtx.createGain();
  amp.gain.value = 0.0001;
  amp.gain.setValueAtTime(1, audioCtx.currentTime);

  let lfo = audioCtx.createOscillator();
  lfo.type = "square";
  lfo.frequency.setValueAtTime(lfoHz, audioCtx.currentTime);

  const streamOutput = audioCtx.createMediaStreamDestination();

  lfo.connect(amp.gain);
  osc.connect(amp).connect(streamOutput);
  lfo.start();
  osc.start();
  osc.stop(audioCtx.currentTime + duration);

  const mediaStream = streamOutput.stream;

  // Stop the stream once the pulse time ends
  setTimeout(() => {
    stopMediaStream(mediaStream);

    logger.log("stopped media stream");

    audioCtx.close().then(() => logger.log("audio context closed"));
  }, duration * 1000);

  return mediaStream;
};
