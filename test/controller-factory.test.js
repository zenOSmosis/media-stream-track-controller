const test = require("tape-async");
const {
  MediaStreamTrackControllerFactory,
  MediaStreamTrackControllerEvents,
  debug,
} = require("../src");
const MediaStreamControllerFactory = require("../src/MediaStreamTrackControllerFactory");

const { EVT_UPDATED, EVT_DESTROYED } = MediaStreamTrackControllerEvents;

test("instantiates MediaStreamTrackControllerFactory", async t => {
  t.plan(7);

  t.throws(
    () => new MediaStreamTrackControllerFactory(),
    "expects inputMediaStream paramter"
  );

  const mediaStream1 = debug.createTestAudioMediaStream();

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
  t.equals(
    factory.getVideoTrackControllers().length,
    0,
    "instantiated factory has one audio track controller"
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
  t.plan(2);

  const selfDestructFactory = new MediaStreamTrackControllerFactory(
    new MediaStream()
  );

  await new Promise(resolve => {
    selfDestructFactory.once(EVT_DESTROYED, () => {
      t.equals(
        selfDestructFactory.getTrackControllers().length,
        0,
        "factory instantiated with empty MediaStream does not have track controllers"
      );

      t.ok(
        true,
        "factory automatically destructs when there are no associated track controllers"
      );

      resolve();
    });
  });

  t.end();
});

test("stop calls destruct", async t => {
  t.plan(3);

  const mediaStream1 = debug.createTestAudioMediaStream();
  const factory1 = new MediaStreamControllerFactory(mediaStream1);
  await Promise.all([
    new Promise(resolve => {
      factory1.once(EVT_DESTROYED, () => {
        t.ok(true, "calling stop() destructs factory");

        resolve();
      });
    }),

    factory1.stop(),
  ]);

  const mediaStream2 = debug.createTestAudioMediaStream();
  const factory2 = new MediaStreamControllerFactory(mediaStream2);
  const factory2TrackController = factory2.getTrackControllers()[0];
  await Promise.all([
    new Promise(resolve => {
      factory2.once(EVT_DESTROYED, () => {
        t.ok(true, "track controller destruct destructs factory");

        resolve();
      });
    }),

    new Promise(resolve => {
      factory2TrackController.once(EVT_DESTROYED, () => {
        t.ok(true, "calling stop() destructs track controller");

        resolve();
      });
    }),

    factory2TrackController.stop(),
  ]);

  t.end();
});

test("factory muting", async t => {
  t.plan(11);

  const ms1 = debug.createTestAudioMediaStream();
  const ms2 = debug.createTestAudioMediaStream();
  const ms3 = debug.createTestAudioMediaStream();
  const ms4 = debug.createTestAudioMediaStream();

  const mediaStream = new MediaStream([
    ...ms1.getTracks(),
    ...ms2.getTracks(),
    ...ms3.getTracks(),
    ...ms4.getTracks(),
  ]);

  t.equals(
    mediaStream.getTracks().length,
    4,
    "converged media stream has 4 tracks"
  );

  const factory = new MediaStreamTrackControllerFactory(mediaStream);

  await factory.onceReady();

  factory.getTrackControllers().forEach((controller, idx) => {
    t.equals(
      controller.getIsMuted(),
      false,
      `controller ${idx} is not muted by default`
    );
  });

  await factory.mute();

  factory.getTrackControllers().forEach((controller, idx) => {
    t.equals(
      controller.getIsMuted(),
      true,
      `controller ${idx} is muted after factory is muted`
    );
  });

  await Promise.all([
    new Promise(resolve => {
      factory.once(EVT_UPDATED, () => {
        t.equals(
          factory.getIsMuted(),
          false,
          "factory changes to unmuted state once a track controller unmutes"
        );

        resolve();
      });
    }),

    factory.getTrackControllers()[2].unmute(),
  ]);

  await Promise.all([
    new Promise(resolve => {
      factory.once(EVT_UPDATED, () => {
        t.equals(
          factory.getIsMuted(),
          true,
          "factory changes back to muted state once all track controllers are muted"
        );

        resolve();
      });
    }),

    factory.getTrackControllers()[2].mute(),
  ]);

  t.end();
});

test("factory and controller input device IDs", async t => {
  t.plan(1);

  const mediaStream = debug.createTestAudioMediaStream();

  const factory = new MediaStreamControllerFactory(mediaStream);

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
