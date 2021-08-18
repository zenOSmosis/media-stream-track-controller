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

  const multiAudioMonitor = new MultiAudioMediaStreamTrackLevelMonitor([
    testTrack1,
    testTrack2,
    testTrack3,
    testTrack4,
  ]);

  multiAudioMonitor.getChildren().forEach((child, idx) => {
    t.ok(
      ![testTrack1, testTrack2, testTrack3, testTrack4].includes(child),
      "MediaStreamTrack array does not include direct children of collection"
    );

    t.ok(
      child instanceof AudioMediaStreamTrackLevelMonitor,
      `child${idx + 1} is an AudioMediaStreamTrackLevelMonitor`
    );
  });

  multiAudioMonitor.getMediaStreamTracks().forEach((track, idx) => {
    t.ok([testTrack1, testTrack2, testTrack3, testTrack4].includes(track));

    t.ok(
      track instanceof MediaStreamTrack,
      `track${idx + 1} is a MediaStreamTrack`
    );
  });

  // FIXME: Using t.throws is not working correct w/ tape-async; this is a
  // workaround
  try {
    await multiAudioMonitor.removeChild("abc");

    throw new Error("should throw error");
  } catch (err) {
    t.ok(
      err instanceof TypeError,
      "throws TypeError when removing child of unexpected type"
    );
  }

  t.equals(
    multiAudioMonitor.getChildren().length,
    multiAudioMonitor.getMediaStreamTracks().length,
    "multi audio monitor contains same amount of tracks as children"
  );

  t.equals(
    multiAudioMonitor.getChildren().length,
    4,
    "multi audio monitor contains 4 tracks"
  );

  await multiAudioMonitor.removeMediaStreamTrack(testTrack3);

  t.equals(
    multiAudioMonitor.getChildren().length,
    3,
    "multi audio monitor contains 3 tracks"
  );

  t.equals(
    multiAudioMonitor.getChildren().length,
    multiAudioMonitor.getMediaStreamTracks().length,
    "multi audio monitor contains same amount of tracks as children"
  );

  t.throws(
    () => {
      multiAudioMonitor.addChild(new MediaStream(), "incorrect-type");
    },
    TypeError,
    "throws TypeError when trying to add child of non-MediaStreamTrack type"
  );

  t.doesNotThrow(() => {
    multiAudioMonitor.addMediaStreamTrack(
      debug.createTestAudioMediaStream().getTracks()[0]
    );
  }, "accepts additional arbitrary call to addMediaStreamTrack()");

  t.doesNotThrow(() => {
    multiAudioMonitor.addChild(
      debug.createTestAudioMediaStream().getTracks()[0]
    );
  }, "accepts additional arbitrary call to addChild() without a key");

  t.equals(
    multiAudioMonitor.getChildren().length,
    5,
    "multi audio monitor contains 5 tracks"
  );

  await multiAudioMonitor.removeAllMediaStreamTracks();

  t.equals(
    multiAudioMonitor.getChildren().length,
    0,
    "multi audio monitor contains 0 tracks after all are removed"
  );

  t.ok(
    !multiAudioMonitor.getIsDestroyed(),
    "multi audio monitor stays running after all tracks are removed"
  );

  t.end();
});

// TODO: For some reason when calling multiAudioMonitor destroy, it locks up the
// test runner (which is one reason the destruct test was isolated), though
// none of the internal destruct handlers seem to lock it up on their own
/*
test("MultiAudioMediaStreamTrackLevelMonitor shutdown handling", async t => {
  t.plan(1);

  const testTrack1 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack2 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack3 = debug.createTestAudioMediaStream().getTracks()[0];
  const testTrack4 = debug.createTestAudioMediaStream().getTracks()[0];

  const multiAudioMonitor = new MultiAudioMediaStreamTrackLevelMonitor([
    testTrack1,
    testTrack2,
    testTrack3,
    testTrack4,
  ]);

  await multiAudioMonitor.destroy();

  t.notOk(
    t.getChildren().length,
    "no children should be present after destruct"
  );

  t.end();
});
*/
