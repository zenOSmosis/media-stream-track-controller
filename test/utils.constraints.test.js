const test = require("tape");
const { utils } = require("../src");

const { makeSpecificDeviceIdCaptureConstraints } =
  utils.constraints.makeSpecificDeviceCaptureConstraints;

test("utils.constraints.mergeConstraints", t => {
  t.plan(1);

  t.deepEquals(
    utils.constraints.mergeConstraints(
      {
        audio: {
          foo: "bar",
        },
      },
      { audio: { test: 123 }, video: false }
    ),
    {
      audio: {
        test: 123,
        foo: "bar",
      },
      video: false,
    },
    "recursively merges"
  );

  t.end();
});

test("makeSpecificDeviceIdCaptureConstraints (audio)", t => {
  t.plan(5);

  t.throws(
    () => {
      makeSpecificDeviceIdCaptureConstraints(
        "test-audio-device-id",
        "audio-video"
      );
    },
    TypeError,
    "throws TypeError when adding invalid device type"
  );

  t.deepEquals(
    makeSpecificDeviceIdCaptureConstraints(
      "test-audio-device-id",
      "audio",
      utils.constraints.makeAudioConstraints()
    ),
    {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
        sampleSize: 16,
        channelCount: 2,
        deviceId: { exact: "test-audio-device-id" },
      },
      video: false,
    },
    "exact deviceId spliced onto default audio constraints (without audio userConstraints root object)"
  );

  t.deepEquals(
    makeSpecificDeviceIdCaptureConstraints("test-audio-device-id", "audio", {
      audio: utils.constraints.makeAudioConstraints(),
    }),
    {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
        sampleSize: 16,
        channelCount: 2,
        deviceId: { exact: "test-audio-device-id" },
      },
      video: false,
    },
    "exact deviceId spliced onto default audio constraints (with audio userConstraints root object)"
  );

  t.deepEquals(
    makeSpecificDeviceIdCaptureConstraints("test-audio-device-id", "audio", {
      audio: true,
    }),
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
    makeSpecificDeviceIdCaptureConstraints("test-audio-device-id", "audio", {
      audio: false,
    }),
    { audio: false },
    "passing boolean false as userConstraints[audio] returns false audio"
  );

  t.end();
});

test("makeSpecificDeviceIdCaptureConstraints (video)", t => {
  t.plan(4);

  t.deepEquals(
    makeSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      utils.constraints.makeVideoConstraints()
    ),
    {
      video: {
        deviceId: {
          exact: "test-video-device-id",
        },
      },
      audio: false,
    },
    "exact deviceId spliced onto default video constraints (without video userConstraints root object)"
  );

  t.deepEquals(
    makeSpecificDeviceIdCaptureConstraints("test-video-device-id", "video", {
      video: utils.constraints.makeVideoConstraints(),
    }),
    {
      video: {
        deviceId: {
          exact: "test-video-device-id",
        },
      },
      audio: false,
    },
    "exact deviceId spliced onto default video constraints (with video userConstraints root object)"
  );

  t.deepEquals(
    makeSpecificDeviceIdCaptureConstraints("test-video-device-id", "video", {
      video: true,
      audio: false,
    }),
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
    makeSpecificDeviceIdCaptureConstraints("test-video-device-id", "video", {
      video: false,
    }),
    {
      video: false,
    },
    "passing boolean false as userConstraints[video] returns video false"
  );

  t.end();
});

test("utils.constraints.makeAudioConstraints", t => {
  t.plan(1);

  t.deepEquals(
    utils.constraints.makeAudioConstraints(),
    {
      // TODO: Obtain presets (refactor?)
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
        sampleSize: 16,
        channelCount: 2,
      },
    },
    "default audio constraints matches high quality audio and false video"
  );

  t.end();
});

// TODO: Implement
/*
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
*/

// TODO: Add additional tests for constraints
