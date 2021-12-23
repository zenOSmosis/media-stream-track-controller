const test = require("tape");
const { debug, utils } = require("../src");
const { mergeConstraints } = require("../src/utils/constraints");

test("pulsing audio media stream is a MediaStream", t => {
  t.plan(1);

  t.ok(debug.createTestAudioMediaStream() instanceof MediaStream);

  t.end();
});

test("utils.stopMediaStream", t => {
  // TODO: Incorporate video streams in to this test

  t.plan(3);

  const mediaStream = debug.createTestAudioMediaStream();

  t.equals(mediaStream.getTracks().length, 1);

  const mediaStream2 = debug.createTestAudioMediaStream();
  mediaStream2.getTracks().forEach(track => mediaStream.addTrack(track));

  t.equals(mediaStream.getTracks().length, 2);

  utils.stopMediaStream(mediaStream);

  t.equals(mediaStream.getTracks().length, 0);

  t.end();
});

test("utils.captureMediaDevice.uncaptureSpecificMediaDevice", async t => {
  t.plan(2);

  // NOTE: t.throws doesn't seem to be working correct when using async
  // methods, so this try / catch is used as a workaround
  try {
    await utils.captureMediaDevice.uncaptureSpecificMediaDevice({
      label: "test",
    });
  } catch (err) {
    t.ok(
      err instanceof ReferenceError,
      "throws ReferenceError when deviceId is not set"
    );
  }

  // NOTE: t.throws doesn't seem to be working correct when using async
  // methods, so this try / catch is used as a workaround
  try {
    await utils.captureMediaDevice.uncaptureSpecificMediaDevice({
      deviceId: "test",
    });
    t.ok("does not throw when deviceId is set");
  } catch (err) {
    throw err;
  }

  // NOTE: At this time, it may be nearly impossible to automatically test this
  // function completely works, so refer to dev UI for manual testing

  t.end();
});

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

test("utils.constraints.mergeConstraints", t => {
  t.plan(1);

  t.deepEquals(
    mergeConstraints(
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

test("utils.constraints.makeSpecificDeviceIdCaptureConstraints (audio)", t => {
  t.plan(5);

  t.throws(
    () => {
      utils.constraints.makeSpecificDeviceIdCaptureConstraints(
        "test-audio-device-id",
        "audio-video"
      );
    },
    TypeError,
    "throws TypeError when adding invalid device type"
  );

  t.deepEquals(
    utils.constraints.makeSpecificDeviceIdCaptureConstraints(
      "test-audio-device-id",
      "audio",
      utils.constraints.createDefaultAudioConstraints()
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
    utils.constraints.makeSpecificDeviceIdCaptureConstraints(
      "test-audio-device-id",
      "audio",
      {
        audio: utils.constraints.createDefaultAudioConstraints(),
      }
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
    "exact deviceId spliced onto default audio constraints (with audio userConstraints root object)"
  );

  t.deepEquals(
    utils.constraints.makeSpecificDeviceIdCaptureConstraints(
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
    utils.constraints.makeSpecificDeviceIdCaptureConstraints(
      "test-audio-device-id",
      "audio",
      {
        audio: false,
      }
    ),
    { audio: false },
    "passing boolean false as userConstraints[audio] returns false audio"
  );

  t.end();
});

test("utils.constraints.makeSpecificDeviceIdCaptureConstraints (video)", t => {
  t.plan(4);

  t.deepEquals(
    utils.constraints.makeSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      utils.constraints.createDefaultVideoConstraints()
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
    utils.constraints.makeSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      {
        video: utils.constraints.createDefaultVideoConstraints(),
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
    "exact deviceId spliced onto default video constraints (with video userConstraints root object)"
  );

  t.deepEquals(
    utils.constraints.makeSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      {
        video: true,
        audio: false,
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
    utils.constraints.makeSpecificDeviceIdCaptureConstraints(
      "test-video-device-id",
      "video",
      {
        video: false,
      }
    ),
    {
      video: false,
    },
    "passing boolean false as userConstraints[video] returns video false"
  );

  t.end();
});

test("utils.constraints.createDefaultAudioConstraints", t => {
  t.plan(1);

  t.deepEquals(
    utils.constraints.createDefaultAudioConstraints(),
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
      video: false,
    },
    "default audio constraints matches high quality audio and false video"
  );

  t.end();
});

// TODO: Add additional tests for constraints
