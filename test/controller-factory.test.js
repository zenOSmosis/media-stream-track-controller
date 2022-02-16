const test = require("tape");
const { sleep } = require("phantom-core");
const { MediaStreamTrackControllerFactory, utils } = require("../src");

const { EVT_UPDATED, EVT_DESTROYED } = MediaStreamTrackControllerFactory;

test("instantiates MediaStreamTrackControllerFactory", async t => {
  t.plan(7);

  t.throws(
    () => new MediaStreamTrackControllerFactory(),
    "expects inputMediaStream parameter"
  );

  const mediaStream1 =
    utils.mediaStream.generators.createTestAudioMediaStream();

  // NOTE: Due to issues w/ testing canvas-generated video streams on iOS
  // simulator, we're only testing for audio here
  const factory = new MediaStreamTrackControllerFactory(mediaStream1);

  await factory.onceReady();

  t.ok(
    factory,
    "instantiates MediaStreamTrackControllerFactory with MediaStream"
  );

  t.equals(
    factory.getTrackControllers().length,
    1,
    "instantiated factory has one track controller"
  );

  t.equals(
    factory.getAudioTrackControllers().length,
    1,
    "instantiated factory has one audio track controller"
  );

  // FIXME: (jh) The reasoning behind this is that all test environments may
  // not be able to initialize this controller; perhaps it should be refactored
  // into a test w/ an if condition to determine if the test should run
  t.equals(
    factory.getVideoTrackControllers().length,
    0,
    "instantiated factory has no video track controllers"
  );

  await Promise.all([
    new Promise(resolve => {
      factory
        .getTrackControllers()[0]
        .on(EVT_UPDATED, function testUpdatePassing(data) {
          if (data === "test") {
            factory
              .getTrackControllers()[0]
              .off(EVT_UPDATED, testUpdatePassing);

            t.ok(
              true,
              "EVT_UPDATED event passed through track controller to factory"
            );

            resolve();
          }
        });
    }),

    factory.getTrackControllers()[0].emit(EVT_UPDATED, "test"),
  ]);

  await Promise.all([
    new Promise(resolve => {
      factory.once(EVT_UPDATED, () => {
        t.equals(
          factory.getTrackControllers().length,
          0,
          "No more track controllers"
        );

        resolve();
      });
    }),

    factory.getTrackControllers()[0].destroy(),
  ]);

  t.end();
});

test("empty MediaStream initialization", async t => {
  t.plan(1);

  const selfDestructFactory = new MediaStreamTrackControllerFactory(
    new MediaStream()
  );

  await new Promise(resolve => {
    selfDestructFactory.once(EVT_DESTROYED, () => {
      t.ok(
        selfDestructFactory.getIsDestroyed(),
        "factory auto destructs when initialized with empty MediaStream"
      );

      resolve();
    });
  });

  t.end();
});

test("factory options", async t => {
  t.plan(3);

  const mediaStream1 =
    utils.mediaStream.generators.createTestAudioMediaStream();

  const mediaStream2 =
    utils.mediaStream.generators.createTestAudioMediaStream();

  const combinedMediaStream = new MediaStream(
    [mediaStream1, mediaStream2].map(stream => stream.getTracks()).flat()
  );

  const factory = new MediaStreamTrackControllerFactory(combinedMediaStream, {
    title: "test factory",
  });

  t.equals(factory.getTitle(), "test factory");

  const trackControllers = factory.getTrackControllers();

  t.equals(trackControllers[0].getTitle(), "test factory");
  t.equals(trackControllers[1].getTitle(), "test factory");

  await factory.destroy();

  t.end();
});

test("factory auto-destruct when all track controllers are removed", async t => {
  t.plan(10);

  const selfDestructFactory = new MediaStreamTrackControllerFactory(
    new MediaStream(
      [...new Array(8)].map(
        () =>
          utils.mediaStream.generators
            .createTestAudioMediaStream()
            .getTracks()[0]
      )
    )
  );

  t.equals(
    selfDestructFactory.getChildren().length,
    8,
    "self-destruct factory initializes with 8 children"
  );

  await Promise.all([
    new Promise(async resolve => {
      selfDestructFactory.once(EVT_DESTROYED, () => {
        t.equals(
          selfDestructFactory.getChildren().length,
          0,
          "self-destruct factory automatically destructed when all children were destructed"
        );

        resolve();
      });
    }),

    new Promise(async resolve => {
      // NOTE: Intentionally not calling destructAllChildren just to test this
      // in a more natural way
      let idx = -1;
      for (const child of selfDestructFactory.getChildren()) {
        ++idx;

        await child.destroy();

        t.ok(true, `child ${idx + 1} destructed`);

        // Not needed, but prolonging time between calls just as a test
        await sleep(10);
      }

      resolve();
    }),
  ]);

  t.end();
});

test("stop calls destruct", async t => {
  t.plan(5);

  const mediaStream1 =
    utils.mediaStream.generators.createTestAudioMediaStream();
  const factory1 = new MediaStreamTrackControllerFactory(mediaStream1);

  await factory1.stop();

  t.ok(factory1.getIsDestroyed(), "calling stop() destructs factory1");

  const mediaStream2 =
    utils.mediaStream.generators.createTestAudioMediaStream();
  const factory2 = new MediaStreamTrackControllerFactory(mediaStream2);
  const factory2TrackController = factory2.getTrackControllers()[0];

  t.equals(factory2._lenChildren, 1, "factory2 has one child before stop");

  await factory2.stop();

  t.equals(factory2._lenChildren, 0, "factory2 has no children after stop");

  t.ok(
    factory2TrackController.getIsDestroyed(),
    "factory2TrackController reports it is destructed after calling factory2 stop"
  );

  t.ok(
    factory2.getIsDestroyed(),
    "factory2TrackController destruct destructs factory2"
  );

  t.end();
});

test("factory and controller input device IDs", async t => {
  t.plan(1);

  const mediaStream = utils.mediaStream.generators.createTestAudioMediaStream();

  const factory = new MediaStreamTrackControllerFactory(mediaStream);

  const trackControllers = factory.getTrackControllers();

  // NOTE: This test media stream may return undefined as the device id; more
  // checking for this is available in the dev UI frontend
  const factoryInputDeviceIds = factory.getInputDeviceIds();

  trackControllers.forEach(controller => {
    t.ok(
      factoryInputDeviceIds.includes(controller.getInputDeviceId()),
      "factory input device ids contains track controller input device id"
    );
  });

  t.end();
});
