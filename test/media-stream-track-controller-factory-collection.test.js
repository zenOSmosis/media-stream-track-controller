const test = require("tape");
const { PhantomCore } = require("phantom-core");
const {
  MediaStreamTrackControllerFactory,
  MediaStreamTrackControllerFactoryCollection,
  utils,
} = require("../src");

const _createTestAudioMediaStream = () => {
  return utils.mediaStream.generators.createTestAudioMediaStream();
};

test("MediaStreamTrackControllerFactoryCollection - audio handling", async t => {
  t.plan(17);

  const factory1 = new MediaStreamTrackControllerFactory(
    _createTestAudioMediaStream()
  );
  const factory2 = new MediaStreamTrackControllerFactory(
    _createTestAudioMediaStream()
  );

  const collection = new MediaStreamTrackControllerFactoryCollection();

  t.throws(
    () => collection.addTrackControllerFactory(new PhantomCore()),
    TypeError,
    "throws TypeError if trying to add non-factory type"
  );

  collection.addTrackControllerFactory(factory1);
  collection.addTrackControllerFactory(factory2);

  t.ok(
    collection.getIsAudioMuted() === false,
    "factory collection audio is not muted by default"
  );

  t.ok(factory1.getIsMuted() === false, "factory 1 is not muted by default");

  await factory1.mute();

  t.ok(factory1.getIsMuted(), "factory 1 is muted");

  t.ok(
    collection.getIsAudioMuted() === false,
    "factory collection audio is not muted if one audio track controller is"
  );

  t.ok(factory2.getIsMuted() === false, "factory 2 is not muted by default");

  await factory2.mute();

  t.ok(factory2.getIsMuted(), "factory 2 is muted");

  t.ok(
    collection.getIsAudioMuted(),
    "factory collection audio is muted if both audio track controllers are"
  );

  await collection.muteAudio();

  t.ok(factory1.getIsMuted(), "factory 1 is muted after collection audio mute");
  t.ok(factory2.getIsMuted(), "factory 2 is muted after collection audio mute");

  await collection.unmuteAudio();

  t.ok(
    factory1.getIsMuted() === false,
    "factory 1 is muted after collection audio unmute"
  );
  t.ok(
    factory2.getIsMuted() === false,
    "factory 2 is muted after collection audio unmute"
  );

  t.ok(
    collection.getTrackControllerFactories().length === 2,
    "2 track controller factories before one is removed"
  );

  collection.removeTrackControllerFactory(factory2);

  t.ok(
    collection.getTrackControllerFactories().length === 1,
    "1 track controller factory after one is removed"
  );

  t.ok(
    factory2.UNSAFE_getIsDestroyed() === false,
    "factory is not destructed when removed from collection"
  );

  t.ok(
    collection.getVideoTrackControllers().length === 0,
    "collection reports no video track controllers"
  );

  await collection.destroy();

  t.ok(
    factory1.UNSAFE_getIsDestroyed() === false,
    "factory stays running after removed from collection"
  );

  t.end();
});
