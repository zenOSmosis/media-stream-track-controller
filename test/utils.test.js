const test = require("tape-async");
const { debug, utils } = require("../src");
const {
  createNormalizedConstraintsOfKind,
  mergeConstraints,
} = require("../src/utils/constraints");

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

  t.ok(
    audioCtx instanceof AudioContext,
    "audioCtx is of browser's AudioContext type"
  );

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

test("utils.constraints.createNormalizedConstraintsOfKind", t => {
  t.plan(6);

  t.deepEquals(
    utils.constraints.createNormalizedConstraintsOfKind("audio", true),
    {
      audio: true,
    },
    "passing boolean true maps to keyed constraint"
  );

  t.deepEquals(
    utils.constraints.createNormalizedConstraintsOfKind("audio", false),
    {
      audio: false,
    },
    "passing boolean false maps to keyed constraint"
  );

  t.deepEquals(
    utils.constraints.createNormalizedConstraintsOfKind("audio", {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      sampleSize: 16,
    }),
    utils.constraints.createNormalizedConstraintsOfKind(
      "audio",
      {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          sampleSize: 16,
        },
      },
      "matches non-base audio object with normalized form"
    )
  );

  t.deepEquals(
    utils.constraints.createNormalizedConstraintsOfKind("audio", {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
        sampleSize: 16,
      },
    }),
    utils.constraints.createNormalizedConstraintsOfKind(
      "audio",
      {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          sampleSize: 16,
        },
      },
      "matches base audio object with normalized form"
    )
  );

  t.deepEquals(
    utils.constraints.createNormalizedConstraintsOfKind("audio", {
      audio: true,
    }),
    {
      audio: true,
    },
    "handles boolean true audio"
  );

  t.deepEquals(
    utils.constraints.createNormalizedConstraintsOfKind("audio", {
      audio: false,
    }),
    {
      audio: false,
    },
    "handles boolean false audio"
  );

  t.end();
});

test("utils.constraints.mergeConstraints", t => {
  t.plan(1);

  t.deepEquals(
    mergeConstraints(
      {
        audio: {
          foo: "bar",
        },
      },
      { audio: { test: 123 } }
    ),
    {
      audio: {
        test: 123,
        foo: "bar",
      },
    },
    "recursively merges"
  );

  t.end();
});

test("utils.constraints.getSpecificDeviceIdCaptureConstraints (audio)", t => {
  // TODO: Reimplement
  // t.plan(5);

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
      ...utils.constraints.createAudioConstraints({
        deviceId: {
          exact: "test-audio-device-id",
        },
      }),
      video: false,
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
      ...utils.constraints.createAudioConstraints({
        deviceId: {
          exact: "test-audio-device-id",
        },
      }),
      video: false,
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
      video: false,
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

test("utils.constraints.getSpecificDeviceIdCaptureConstraints (video)", t => {
  t.plan(4);

  t.deepEquals(
    utils.constraints.getSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      utils.constraints.createVideoConstraints()
    ),
    {
      ...utils.constraints.createVideoConstraints({
        deviceId: {
          exact: "test-video-device-id",
        },
      }),
      audio: false,
    },
    "exact deviceId spliced onto default video constraints (without video userConstraints root object)"
  );

  t.deepEquals(
    utils.constraints.getSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      {
        video: utils.constraints.createVideoConstraints(),
      }
    ),
    {
      ...utils.constraints.createVideoConstraints({
        deviceId: {
          exact: "test-video-device-id",
        },
      }),
      audio: false,
    },
    "exact deviceId spliced onto default video constraints (with video userConstraints root object)"
  );

  t.deepEquals(
    utils.constraints.getSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      {
        video: true,
      }
    ),
    {
      video: {
        deviceId: {
          exact: "test-video-device-id",
        },
      },
      audio: false,
    },
    "passing boolean true as userConstraints[video] does not override deviceId"
  );

  t.deepEquals(
    utils.constraints.getSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      {
        video: false,
      }
    ),
    {},
    "passing boolean false as userConstraints[video] returns empty object"
  );

  t.end();
});

test("utils.constraints.createAudioConstraints", t => {
  t.plan(1);

  t.deepEquals(
    Object.keys(utils.constraints.createAudioConstraints()),
    ["audio"],
    "create audio constraints has audio key"
  );

  t.end();
});

// TODO: Add additional tests for constraints
