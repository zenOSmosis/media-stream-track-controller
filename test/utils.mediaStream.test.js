const test = require("tape");
const { utils } = require("../src");

test("utils.mediaStream.stopMediaStream", t => {
  // TODO: Incorporate video streams in to this test?

  t.plan(2);

  const mediaStream1 =
    utils.mediaStream.generators.createTestAudioMediaStream();

  const mediaStream2 =
    utils.mediaStream.generators.createTestAudioMediaStream();

  mediaStream2.getTracks().forEach(track => mediaStream1.addTrack(track));

  const mediaStream3 =
    utils.mediaStream.generators.createTestAudioMediaStream();

  mediaStream3.getTracks().forEach(track => mediaStream1.addTrack(track));

  t.equals(
    mediaStream1.getTracks().length,
    3,
    "three tracks are existent before stopping the stream"
  );

  utils.mediaStream.stopMediaStream(mediaStream1);

  t.equals(
    mediaStream1.getTracks().length,
    0,
    "tracks are removed from stopped media stream"
  );

  t.end();
});

test("audio generators produce MediaStream instances", t => {
  t.plan(2);

  t.ok(
    utils.mediaStream.generators.createTestAudioMediaStream() instanceof
      MediaStream
  );

  t.ok(
    utils.mediaStream.generators.createEmptyAudioMediaStream() instanceof
      MediaStream
  );

  t.end();
});
