const test = require("tape");
const {
  AudioMediaStreamTrackLevelMonitor,
  MultiAudioMediaStreamTrackLevelMonitor,
  utils,
} = require("../src");

const { EVT_AUDIO_LEVEL_UPDATE } = MultiAudioMediaStreamTrackLevelMonitor;

test("MultiAudioMediaStreamTrackLevelMonitor MediaStreamTrack / LevelMonitor type validations / shutdown handling", async t => {
  t.plan(30);

  const testTrack1 = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];
  const testTrack2 = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];
  const testTrack3 = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];
  const testTrack4 = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];

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

    throw new Error("should not throw error");
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

  t.doesNotThrow(() => {
    multiAudioMonitor.addChild(testTrack1);
  }, "does not throw when trying to add media stream track as direct child");

  t.doesNotThrow(() => {
    multiAudioMonitor.addMediaStreamTrack(testTrack1);
  }, "does not throw when trying to add duplicate media stream track");

  t.equals(
    multiAudioMonitor.getChildren().length,
    4,
    "multi audio monitor contains 4 tracks and does not add duplicate media stream track"
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
      utils.mediaStream.generators.createTestAudioMediaStream().getTracks()[0]
    );
  }, "accepts additional arbitrary call to addMediaStreamTrack()");

  t.doesNotThrow(() => {
    multiAudioMonitor.addChild(
      utils.mediaStream.generators.createTestAudioMediaStream().getTracks()[0]
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
    !multiAudioMonitor.getHasDestroyStarted(),
    "multi audio monitor stays running after all tracks are removed"
  );

  // FIXME: Using t.throws is not working correct w/ tape-async; this is a
  // workaround
  try {
    await multiAudioMonitor.destroy();

    t.ok(true, "should not throw error when destroying");
  } catch (err) {
    t.notOk(err, "should not throw error when destroying");
  }

  t.end();
});

test("AudioMediaStreamTrackLevelMonitor emit 0 audio level on destruct", async t => {
  t.plan(1);

  const testTrack = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];

  const audioMonitor = new AudioMediaStreamTrackLevelMonitor(testTrack);

  let isDestructing = false;

  await Promise.all([
    new Promise(resolve => {
      audioMonitor.on(EVT_AUDIO_LEVEL_UPDATE, audioLevel => {
        if (isDestructing && audioLevel === 0) {
          t.ok(true, "captured 0 RMS level after signaling for destruct");

          resolve();
        }
      });
    }),

    new Promise(async resolve => {
      isDestructing = true;

      await audioMonitor.destroy();

      resolve();
    }),
  ]);

  t.end();
});

test("MultiAudioMediaStreamTrackLevelMonitor clear children reset", async t => {
  t.plan(1);

  const testTrack1 = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];
  const testTrack2 = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];
  const testTrack3 = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];
  const testTrack4 = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];

  const multiAudioMonitor = new MultiAudioMediaStreamTrackLevelMonitor([
    testTrack1,
    testTrack2,
    testTrack3,
    testTrack4,
  ]);

  await Promise.all([
    new Promise(resolve => {
      let debouncedTimeout = null;

      multiAudioMonitor.on(EVT_AUDIO_LEVEL_UPDATE, audioLevel => {
        clearTimeout(debouncedTimeout);

        // IMPORTANT: This timeout is necessary because getChildren() won't
        // return 0 exactly when this final audioLevel event emits, but will be
        // soon afterwards
        debouncedTimeout = window.setTimeout(() => {
          if (
            multiAudioMonitor.getChildren().length === 0 &&
            audioLevel === 0
          ) {
            t.ok(
              true,
              "captured 0 RMS level after removing all media stream tracks"
            );

            resolve();
          }
        }, 0);
      });
    }),

    multiAudioMonitor.removeAllMediaStreamTracks(),
  ]);

  t.end();
});
