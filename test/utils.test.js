const test = require("tape-async");
const { debug, utils } = require("../src");

test("pulsing audio media stream is a MediaStream", t => {
  t.plan(1);

  t.ok(debug.getPulsingAudioMediaStream() instanceof MediaStream);

  t.end();
});

test("utils.stopMediaStream", t => {
  // TODO: Incorporate video streams in to this test

  t.plan(3);

  const mediaStream = debug.getPulsingAudioMediaStream();

  t.equals(mediaStream.getTracks().length, 1);

  const mediaStream2 = debug.getPulsingAudioMediaStream();
  mediaStream2.getTracks().forEach(track => mediaStream.addTrack(track));

  t.equals(mediaStream.getTracks().length, 2);

  utils.stopMediaStream(mediaStream);

  t.equals(mediaStream.getTracks().length, 0);

  t.end();
});

test("utils.getSharedAudioContext", t => {
  t.plan(3);

  const audioCtx = utils.getSharedAudioContext();

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  t.ok(AudioContext, "audioCtx is of AudioContext type");

  const audioCtx2 = utils.getSharedAudioContext();

  t.ok(
    Object.is(audioCtx, audioCtx2),
    "subsequent call to getSharedAudioContext() retrieves same audio context"
  );

  const audioCtx3 = utils.getNewAudioContext();
  t.ok(
    !Object.is(audioCtx, audioCtx3),
    "getNewAudioContext() is different than shared audio context"
  );

  t.end();
});

// TODO: Add additional tests for constraints (including video getSpecificDeviceIdCaptureConstraints)

test("utils.constraints.getSpecificDeviceIdCaptureConstraints (audio)", t => {
  t.plan(5);

  t.throws(
    () => {
      utils.constraints.getSpecificDeviceIdCaptureConstraints(
        "test-audio-device-id",
        "audio-video"
      );
    },
    TypeError,
    "throws TypeError when adding invalid device type"
  );

  t.deepEquals(
    utils.constraints.getSpecificDeviceIdCaptureConstraints(
      "test-audio-device-id",
      "audio",
      utils.constraints.createAudioConstraints()
    ),
    {
      audio: {
        ...utils.constraints.createAudioConstraints(),
        deviceId: {
          exact: "test-audio-device-id",
        },
      },
    },
    "exact deviceId spliced onto default audio constraints (without audio userConstraints root object)"
  );

  t.deepEquals(
    utils.constraints.getSpecificDeviceIdCaptureConstraints(
      "test-audio-device-id",
      "audio",
      {
        audio: utils.constraints.createAudioConstraints(),
      }
    ),
    {
      audio: {
        ...utils.constraints.createAudioConstraints(),
        deviceId: {
          exact: "test-audio-device-id",
        },
      },
    },
    "exact deviceId spliced onto default audio constraints (with audio userConstraints root object)"
  );

  t.deepEquals(
    utils.constraints.getSpecificDeviceIdCaptureConstraints(
      "test-audio-device-id",
      "audio",
      {
        audio: true,
      }
    ),
    {
      audio: {
        deviceId: {
          exact: "test-audio-device-id",
        },
      },
    },
    "passing boolean true as userConstraints[audio] does not override deviceId"
  );

  t.deepEquals(
    utils.constraints.getSpecificDeviceIdCaptureConstraints(
      "test-audio-device-id",
      "audio",
      {
        audio: false,
      }
    ),
    {},
    "passing boolean false as userConstraints[audio] returns empty object"
  );

  t.end();
});
