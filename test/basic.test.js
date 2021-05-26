const test = require("tape-async");
const {
  MediaStreamTrackControllerFactory,
  MediaStreamTrackControllerEvents,
  debug,
} = require("../src");

const { EVT_UPDATED } = MediaStreamTrackControllerEvents;

test("instantiates MediaStreamTrackControllerFactory", async t => {
  t.plan(4);

  t.throws(
    () => new MediaStreamTrackControllerFactory(),
    "expects inputMediaStream paramter"
  );

  const mediaStream1 = debug.getPulsingAudioMediaStream();

  const factory = new MediaStreamTrackControllerFactory(mediaStream1);

  // FIXME: This does not work w/ Chrome for some strange reason w/ tape-async testing
  // await factory.onceReady();
  // or...
  // await new Promise(resolve => factory.once(EVT_READY, resolve));

  t.ok(
    factory,
    "instantiates MediaStreamTrackControllerFactory with MediaStream"
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
