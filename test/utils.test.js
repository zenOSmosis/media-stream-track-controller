const test = require("tape-async");
const { debug, utils } = require("../src");

// TODO: Add tests for constraints

test("pulsing audio media stream is a MediaStream", t => {
  t.plan(1);

  t.ok(debug.getPulsingAudioMediaStream() instanceof MediaStream);

  t.end();
});

test("utils.stopMediaStream", t => {
  // TODO: Incorporate video streams in to this test

  t.plan(3);

  const mediaStream = debug.getPulsingAudioMediaStream();

  t.equals(mediaStream.getTracks().length, 1);

  const mediaStream2 = debug.getPulsingAudioMediaStream();
  mediaStream2.getTracks().forEach(track => mediaStream.addTrack(track));

  t.equals(mediaStream.getTracks().length, 2);

  utils.stopMediaStream(mediaStream);

  t.equals(mediaStream.getTracks().length, 0);

  t.end();
});

test("utils.getSharedAudioContext", t => {
  t.plan(3);

  const audioCtx = utils.getSharedAudioContext();

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  t.ok(AudioContext, "audioCtx is of AudioContext type");

  const audioCtx2 = utils.getSharedAudioContext();

  t.ok(
    Object.is(audioCtx, audioCtx2),
    "subsequent call to getSharedAudioContext() retrieves same audio context"
  );

  const audioCtx3 = utils.getNewAudioContext();
  t.ok(
    !Object.is(audioCtx, audioCtx3),
    "getNewAudioContext() is different than shared audio context"
  );

  t.end();
});
