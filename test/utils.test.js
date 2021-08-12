const test = require("tape-async");
const { debug, utils } = require("../src");
const { mergeConstraints } = require("../src/utils/constraints");

const MOCK_MEDIA_DEVICES = [
  {
    deviceId: "default",
    kind: "audioinput",
    label: "Default",
    groupId: "356c14c86433feeb9a7af5d05949fdce43fe653d1b8a3c7c4700c05789961e51",
  },
  {
    deviceId:
      "d52f39bf56b99e78edfa08792464b41b253778c54101d1d6186cc2a3df1c5341",
    kind: "audioinput",
    label: "Built-in Audio Analog Stereo",
    groupId: "665d59d67c28bfec8594f022af4246cb2db1fac5f8b20775932af647b18e2100",
  },
  {
    deviceId:
      "6d6687fed2540849d566df07c9d9a411fa6d54843a9c4028c247dba173c49800",
    kind: "videoinput",
    label: "HP HD Camera (05c8:0383)",
    groupId: "19a792eb3fde82b819db42ff5d9c775d87c98b08852c276e40543ab36d4682df",
  },
  {
    deviceId:
      "e522c46bfc297e97a63abdd019ed73b7a48440d2e90f732ecea576d492b67693",
    kind: "audioinput",
    label: "Scarlett Solo USB Analog Stereo",
    groupId: "9253a523d57bf06af9ce171e7ddc6befc8e4c0216f1eb8ace9d16beef14612dc",
  },
  {
    deviceId: "default",
    kind: "audiooutput",
    label: "Default",
    groupId: "default",
  },
  {
    deviceId:
      "4c71bcbab3d150ab5139c170c90bc79637fafd27a50e667085a8832262f1de71",
    kind: "audiooutput",
    label: "Built-in Audio Analog Stereo",
    groupId: "665d59d67c28bfec8594f022af4246cb2db1fac5f8b20775932af647b18e2100",
  },

  {
    deviceId:
      "5qpbnstoq81w4oo1mas66pojuvqbx6hyrm82s7quzfo06bv8rhfzncdxruzn4ujm",
    kind: "videooutput",
    label: "Fake Video Output 1",
    groupId: "kxwsy40vt6za71qzpcml5ygj4iz90el5utgezcqzpcuvzcypm577b61ouoz9ye5w",
  },
  {
    deviceId:
      "d073lm4q8rm6f8xako3d578y1wv8fuhw8stmiltu25p2ruxg2t460ex7fblc1gyh",
    kind: "videooutput",
    label: "Fake Video Output 2",
    groupId: "o78uo5gwy86ipxzkm15atfc3ii9kqtm7aj5n9zdan8tpomhe3jswvpsl8541lic8",
  },
];

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

// TODO: Implement utils.fetchMediaDevices.filter... tests
/*
test("utils.fetchMediaDevices filters", t => {
  // TODO: Use mock devices of all types
});
*/

test("utils.getMatchedMediaDevice", t => {
  t.plan(8);

  t.throws(
    () => {
      utils.getMatchedMediaDevice(
        {
          deviceId: "old-device-id",
          kind: "audioinput",
          label: "Built-in Audio Analog Stereo",
          groupId: "old-group-id",
        },
        MOCK_MEDIA_DEVICES
      );
    },
    ReferenceError,
    "throws ReferenceError when no kind is specified"
  );

  t.throws(
    () => {
      utils.getMatchedMediaDevice(
        "fake-kind",
        {
          deviceId: "old-device-id",
          kind: "audioinput",
          label: "Built-in Audio Analog Stereo",
          groupId: "old-group-id",
        },
        MOCK_MEDIA_DEVICES
      );
    },
    ReferenceError,
    "throws ReferenceError when invalid kind is specified"
  );

  t.deepEquals(
    utils.getMatchedMediaDevice(
      "audioinput",
      {
        deviceId: "old-device-id",
        kind: "audioinput",
        label: "Built-in Audio Analog Stereo",
        groupId: "old-group-id",
      },
      MOCK_MEDIA_DEVICES
    ),
    {
      deviceId:
        "d52f39bf56b99e78edfa08792464b41b253778c54101d1d6186cc2a3df1c5341",
      kind: "audioinput",
      label: "Built-in Audio Analog Stereo",
      groupId:
        "665d59d67c28bfec8594f022af4246cb2db1fac5f8b20775932af647b18e2100",
    },
    "matches on changed device and group id"
  );

  t.deepEquals(
    utils.getMatchedMediaDevice(
      "audioinput",
      {
        deviceId:
          "d52f39bf56b99e78edfa08792464b41b253778c54101d1d6186cc2a3df1c5341",
      },
      MOCK_MEDIA_DEVICES
    ),
    {
      deviceId:
        "d52f39bf56b99e78edfa08792464b41b253778c54101d1d6186cc2a3df1c5341",
      kind: "audioinput",
      label: "Built-in Audio Analog Stereo",
      groupId:
        "665d59d67c28bfec8594f022af4246cb2db1fac5f8b20775932af647b18e2100",
    },
    "matches on device id"
  );

  t.deepEquals(
    utils.getMatchedMediaDevice(
      "audioinput",
      {
        label: "Scarlett Solo USB Analog Stereo",
      },
      MOCK_MEDIA_DEVICES
    ),
    {
      deviceId:
        "e522c46bfc297e97a63abdd019ed73b7a48440d2e90f732ecea576d492b67693",
      kind: "audioinput",
      label: "Scarlett Solo USB Analog Stereo",
      groupId:
        "9253a523d57bf06af9ce171e7ddc6befc8e4c0216f1eb8ace9d16beef14612dc",
    },
    "matches on label"
  );

  t.deepEquals(
    utils.getMatchedMediaDevice(
      "audioinput",
      {
        label: undefined,
      },
      MOCK_MEDIA_DEVICES
    ),
    null,
    "no match on undefined label"
  );

  t.deepEquals(
    utils.getMatchedMediaDevice(
      "audioinput",
      {
        label: "some-unknown-label",
      },
      MOCK_MEDIA_DEVICES
    ),
    null,
    "no match on unknown label"
  );

  t.deepEquals(
    utils.getMatchedMediaDevice("audioinput", {}, MOCK_MEDIA_DEVICES),
    null,
    "no match on no previous info"
  );

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

test("utils.captureMediaDevice.getMediaDeviceTrackControllers", t => {
  t.plan(2);

  t.throws(
    () => {
      utils.captureMediaDevice.getMediaDeviceTrackControllers({ label: test });
    },
    ReferenceError,
    "throws ReferenceError when no deviceId is set"
  );

  t.deepEquals(
    utils.captureMediaDevice.getMediaDeviceTrackControllers({
      deviceId: "test",
    }),
    [],
    "matches empty array for controllers with device id of test"
  );

  // NOTE: At this time, it may be nearly impossible to automatically test this
  // function completely works, so refer to dev UI for manual testing

  t.end();
});

test("utils.captureMediaDevice.getIsMediaDeviceBeingCaptured", t => {
  t.plan(2);

  t.throws(
    () => {
      utils.captureMediaDevice.getIsMediaDeviceBeingCaptured({ label: test });
    },
    ReferenceError,
    "throws ReferenceError when no deviceId is set"
  );

  t.equals(
    utils.captureMediaDevice.getIsMediaDeviceBeingCaptured({
      deviceId: "test",
    }),
    false,
    "test device id is not reported as being captured"
  );

  // NOTE: At this time, it may be nearly impossible to automatically test this
  // function completely works, so refer to dev UI for manual testing

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
