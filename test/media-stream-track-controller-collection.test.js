const test = require("tape");
const { sleep } = require("phantom-core");
const {
  AudioMediaStreamTrackController,
  MediaStreamTrackControllerCollection,
  utils,
} = require("../src");

const { EVT_CHILD_INSTANCE_ADDED, EVT_CHILD_INSTANCE_REMOVED } =
  MediaStreamTrackControllerCollection;

const _createTestAudioMediaStreamController = () => {
  const mediaStreamTrack = utils.mediaStream.generators
    .createTestAudioMediaStream()
    .getTracks()[0];

  return new AudioMediaStreamTrackController(mediaStreamTrack);
};

test("MediaStreamTrackControllerCollection", async t => {
  t.plan(23);

  const [controller1, controller2, controller3, controller4] = [
    ...new Array(4),
  ].map(() => _createTestAudioMediaStreamController());

  t.ok(
    controller1 instanceof AudioMediaStreamTrackController,
    "controller1 is an AudioMediaStreamController"
  );

  const collection = new MediaStreamTrackControllerCollection([
    controller1,
    controller2,
    controller3,
  ]);

  t.throws(() =>
    collection.addChild(
      new MediaStreamTrackControllerCollection(),
      TypeError,
      "throws TypeError when trying to add child which is not a MediaStreamTrackController"
    )
  );
  t.throws(() =>
    collection.addTrackController(
      new MediaStreamTrackControllerCollection(),
      TypeError,
      "throws TypeError when trying to add media stream track controller which is not a MediaStreamTrackController"
    )
  );

  t.ok(!collection.getIsMuted(), "collection is not muted initially");

  t.ok(!controller1.getIsMuted(), "controller1 is not muted initially");
  t.ok(!controller2.getIsMuted(), "controller2 is not muted initially");
  t.ok(!controller3.getIsMuted(), "controller3 is not muted initially");

  await collection.setIsMuted(true);

  t.ok(
    controller1.getIsMuted(),
    "controller1 is muted after collection is muted"
  );
  t.ok(
    controller2.getIsMuted(),
    "controller2 is muted after collection is muted"
  );
  t.ok(
    controller3.getIsMuted(),
    "controller3 is muted after collection is muted"
  );

  await controller2.setIsMuted(false);

  t.ok(
    !controller2.getIsMuted(),
    "collection is no longer muted after controller2 unmutes"
  );

  await controller2.setIsMuted(true);

  t.ok(
    collection.getIsMuted(),
    "collection is muted again after controller2 mutes"
  );

  await Promise.all([
    new Promise(resolve => {
      collection.once(EVT_CHILD_INSTANCE_ADDED, refController4 => {
        t.ok(
          Object.is(refController4, controller4),
          "EVT_CHILD_INSTANCE_ADDED passes expected controller"
        );

        t.ok(
          !refController4.getIsMuted(),
          "refController4 is not muted by default"
        );

        t.ok(
          !collection.getIsMuted(),
          "collection is no longer in muted state with addition of new controller"
        );

        resolve();
      });
    }),

    new Promise(resolve => {
      collection.once(EVT_CHILD_INSTANCE_REMOVED, refController4 => {
        t.ok(
          Object.is(refController4, controller4),
          "EVT_CHILD_INSTANCE_REMOVED passes expected controller"
        );

        t.ok(
          !refController4.getIsMuted(),
          "refController4 is still not in a muted state"
        );

        t.ok(
          collection.getIsMuted(),
          "collection is again in muted state with controller4 removed"
        );

        resolve();
      });
    }),

    new Promise(async resolve => {
      collection.addTrackController(controller4);

      await sleep(1000);

      collection.removeTrackController(controller4);

      resolve();
    }),
  ]);

  // Ensure that track controllers remain running after collection is destroyed
  await collection.destroy();
  t.ok(collection.getIsDestroyed(), "collection reports it is destructed");
  t.ok(
    !controller1.getIsDestroyed(),
    "controller1 reports that it is not destructed"
  );
  t.ok(
    !controller2.getIsDestroyed(),
    "controller2 reports that it is not destructed"
  );
  t.ok(
    !controller3.getIsDestroyed(),
    "controller3 reports that it is not destructed"
  );
  t.ok(
    !controller4.getIsDestroyed(),
    "controller4 reports that it is not destructed"
  );

  t.end();
});

test("MediaStreamTrackControllerCollection MediaStream", async t => {
  t.plan(7);

  const [controller1, controller2, controller3, controller4] = [
    ...new Array(4),
  ].map(() => _createTestAudioMediaStreamController());

  const collection = new MediaStreamTrackControllerCollection([
    controller1,
    controller2,
  ]);

  t.ok(
    collection.getOutputMediaStream() instanceof MediaStream,
    "getOutputMediaStream() returns a MediaStream"
  );

  t.equals(
    collection.getOutputMediaStream().getTracks().length,
    2,
    "mediaStream.getTracks() contains 2 tracks"
  );

  collection.addTrackController(controller3);

  t.equals(
    collection.getOutputMediaStream().getTracks().length,
    3,
    "mediaStream.getTracks() contains 3 tracks"
  );

  await Promise.all([
    // FIXME: This event is not emit on the output MediaStream when the a track is removed
    /*
    new Promise(resolve => {
      collection
        .getOutputMediaStream()
        .addEventListener("removetrack", track => {
          t.ok(
            Object.is(track, controller3.getOutputMediaStreamTrack()),
            "MediaStream emits removetrack with controller3 track"
          );

          resolve();
        });
    }),
    */

    new Promise(async resolve => {
      // FIXME: Uncomment if the above FIXME is ever resolved
      // await sleep(500)

      t.doesNotThrow(
        () => collection.removeTrackController(controller3),
        "removed track controller3"
      );

      resolve();
    }),
  ]);

  // NOTE: This test case is strictly for consistency even if it might be
  // testing a potential bug (refer to workaround-082320212130 in
  // MediaStreamTrackControllerCollection)
  t.equals(
    collection.getOutputMediaStream().getTracks().length,
    3,
    "mediaStream.getTracks() contains 3 tracks"
  );

  await sleep(500);

  t.equals(
    collection.getOutputMediaStream().getTracks()[2].readyState,
    "live",
    "last mediaStream track is still live after calling mediaStream.removeTrack"
  );

  collection.addTrackController(controller4);

  t.equals(
    collection.getOutputMediaStream().getTracks().length,
    4,
    "mediaStream.getTracks() contains 4 tracks"
  );

  t.end();
});
