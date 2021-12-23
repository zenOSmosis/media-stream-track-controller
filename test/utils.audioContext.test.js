const test = require("tape");
const { utils } = require("../src");

test("utils.audioContext", t => {
  t.plan(3);

  const audioCtx = utils.audioContext.getSharedAudioContext();

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  t.ok(
    audioCtx instanceof AudioContext,
    "audioCtx is of browser's AudioContext type"
  );

  const audioCtx2 = utils.audioContext.getSharedAudioContext();

  t.ok(
    Object.is(audioCtx, audioCtx2),
    "subsequent call to getSharedAudioContext() retrieves same audio context"
  );

  const audioCtx3 = utils.audioContext.createNewAudioContext();
  t.ok(
    !Object.is(audioCtx, audioCtx3),
    "createNewAudioContext() is different than shared audio context"
  );

  // TODO: untilAudioContextResumed may not be able to be tested w/o mocking touch

  t.end();
});
