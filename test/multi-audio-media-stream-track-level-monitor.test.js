const test = require("tape-async");
const {
  debug,
  AudioMediaStreamTrackLevelMonitor,
  MultiAudioMediaStreamTrackLevelMonitor,
} = require("../src");

test("MultiAudioMediaStreamTrackLevelMonitor MediaStreamTrack / LevelMonitor type validations", async t => {
  t.plan(27);

  const testTrack1 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack2 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack3 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack4 = debug.createTestAudioMediaStream().getTracks()[0];

  const audioMonitor = new MultiAudioMediaStreamTrackLevelMonitor([
    testTrack1,
    testTrack2,
    testTrack3,
    testTrack4,
  ]);

  audioMonitor.getChildren().forEach((child, idx) => {
    t.ok(
      ![testTrack1, testTrack2, testTrack3, testTrack4].includes(child),
      "MediaStreamTrack array does not include direct children of collection"
    );

    t.ok(
      child instanceof AudioMediaStreamTrackLevelMonitor,
      `child${idx + 1} is an AudioMediaStreamTrackLevelMonitor`
    );
  });

  audioMonitor.getMediaStreamTracks().forEach((track, idx) => {
    t.ok([testTrack1, testTrack2, testTrack3, testTrack4].includes(track));

    t.ok(
      track instanceof MediaStreamTrack,
      `track${idx + 1} is a MediaStreamTrack`
    );
  });

  // FIXME: Using t.throws is not working correct w/ tape-async; this is a
  // workaround
  try {
    await audioMonitor.removeChild("abc");

    throw new Error("should throw error");
  } catch (err) {
    t.ok(
      err instanceof TypeError,
      "throws TypeError when removing child of unexpected type"
    );
  }

  t.equals(
    audioMonitor.getChildren().length,
    audioMonitor.getMediaStreamTracks().length,
    "multi audio monitor contains same amount of tracks as children"
  );

  t.equals(
    audioMonitor.getChildren().length,
    4,
    "multi audio monitor contains 4 tracks"
  );

  await audioMonitor.removeMediaStreamTrack(testTrack3);

  t.equals(
    audioMonitor.getChildren().length,
    3,
    "multi audio monitor contains 3 tracks"
  );

  t.equals(
    audioMonitor.getChildren().length,
    audioMonitor.getMediaStreamTracks().length,
    "multi audio monitor contains same amount of tracks as children"
  );

  t.throws(
    () => {
      audioMonitor.addChild(new MediaStream(), "incorrect-type");
    },
    TypeError,
    "throws TypeError when trying to add child of non-MediaStreamTrack type"
  );

  t.doesNotThrow(() => {
    audioMonitor.addMediaStreamTrack(
      debug.createTestAudioMediaStream().getTracks()[0]
    );
  }, "accepts additional arbitrary call to addMediaStreamTrack()");

  t.doesNotThrow(() => {
    audioMonitor.addChild(debug.createTestAudioMediaStream().getTracks()[0]);
  }, "accepts additional arbitrary call to addChild() without a key");

  t.equals(
    audioMonitor.getChildren().length,
    5,
    "multi audio monitor contains 5 tracks"
  );

  await audioMonitor.removeAllMediaStreamTracks();

  t.equals(
    audioMonitor.getChildren().length,
    0,
    "multi audio monitor contains 0 tracks after all are removed"
  );

  t.ok(
    !audioMonitor.getIsDestroyed(),
    "multi audio monitor stays running after all tracks are removed"
  );

  t.end();
});

// TODO: For some reason when calling audioMonitor destroy, it locks up the
// test runner (which is one reason the destruct test was isolated), though
// none of the internal destruct handlers seem to lock it up on their own
/*
test("MultiAudioMediaStreamTrackLevelMonitor shutdown handling", async t => {
  t.plan(1);

  const testTrack1 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack2 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack3 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack4 = debug.createTestAudioMediaStream().getTracks()[0];

  const audioMonitor = new MultiAudioMediaStreamTrackLevelMonitor([
    testTrack1,
    testTrack2,
    testTrack3,
    testTrack4,
  ]);

  await audioMonitor.destroy();

  t.notOk(
    t.getChildren().length,
    "no children should be present after destruct"
  );

  t.end();
});
*/
