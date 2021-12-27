const test = require("tape");
const { utils } = require("../src");
const MOCK_MEDIA_DEVICES = require("./mock-media-devices");

test("utils.mediaDevice.fetchMediaDevices", async t => {
  const runOne = await utils.mediaDevice.fetchMediaDevices(false);
  const runTwo = await utils.mediaDevice.fetchMediaDevices(false);

  // Dynamically plan the test based on number of retrieved devices, which can
  // vary across test runners, as they are browser-based
  t.plan(runOne.length + 1);

  t.ok(
    typeof utils.mediaDevice.fetchMediaDevices(false).then === "function",
    "fetchMediaDevices is a promise"
  );

  for (const idx in runOne) {
    t.ok(
      Object.is(runOne[idx], runTwo[idx]),
      `mediaDeviceInfo element ${idx} is the same across two calls`
    );
  }

  t.end();
});

test("utils.mediaDevice.cacheDiffMediaDevices", t => {
  // FIXME: For this test, the t.plan() is not currently used because of the
  // complexity in calculating it due to the way the test is constructed.
  // Perhaps a better idea is to split this test up into smaller tests.

  const PARALLEL_MOCK_MEDIA_DEVICES = [...MOCK_MEDIA_DEVICES].map(object => {
    const ret = {};

    Object.entries(object).forEach(([key, value]) => {
      ret[key] = value;
    });

    return ret;
  });

  // Prelude test (doesn't directly test cacheDiffMediaDevices itself but
  // ensures the passed in data is different, just as subsequent calls to the
  // browser's fetchMediaDevices returns different instances)
  for (const idx in MOCK_MEDIA_DEVICES) {
    t.ok(
      !Object.is(MOCK_MEDIA_DEVICES[idx], PARALLEL_MOCK_MEDIA_DEVICES[idx]),
      `PARALLEL_MOCK_MEDIA_DEVICE idx ${idx} is not the same object instance as the original`
    );
  }

  // Test w/ equal number of elements
  (() => {
    const cacheDiff = utils.mediaDevice.cacheDiffMediaDevices(
      PARALLEL_MOCK_MEDIA_DEVICES,
      MOCK_MEDIA_DEVICES
    );

    for (const idx in cacheDiff) {
      t.ok(
        Object.is(cacheDiff[idx], PARALLEL_MOCK_MEDIA_DEVICES[idx]),
        `cacheDiff1 idx ${idx} is same object as parallel media devices with same idx`
      );
      t.ok(
        !Object.is(cacheDiff[idx], MOCK_MEDIA_DEVICES[idx]),
        `cacheDiff1 idx ${idx} is different object as mock media devices with same idx`
      );
    }
  })();

  // Test w/ removed elements
  const cachedDiffRemoved = (() => {
    const cachedDiffRemoved = utils.mediaDevice.cacheDiffMediaDevices(
      PARALLEL_MOCK_MEDIA_DEVICES,
      MOCK_MEDIA_DEVICES.slice(0, 4)
    );

    t.equals(cachedDiffRemoved.length, 4);

    return cachedDiffRemoved;
  })();

  // Test w/ added elements
  (() => {
    t.ok(
      cachedDiffRemoved.length < MOCK_MEDIA_DEVICES.length,
      "removed cache diff has less elements than before cache re-add"
    );

    const updatedCacheDiff = utils.mediaDevice.cacheDiffMediaDevices(
      cachedDiffRemoved,
      MOCK_MEDIA_DEVICES
    );

    t.ok(
      updatedCacheDiff.length > cachedDiffRemoved.length,
      "updated add cache has more elements than removed cache"
    );

    t.equals(
      updatedCacheDiff.length,
      MOCK_MEDIA_DEVICES.length,
      "updated add cache has same amount of elements as expected"
    );
  })();

  t.end();
});

test("utils.mediaDevice.mediaDeviceInfoFilters", t => {
  t.plan(6);

  t.deepEquals(
    utils.mediaDevice.mediaDeviceInfoFilters.filterInputMediaDevices(
      MOCK_MEDIA_DEVICES
    ),
    MOCK_MEDIA_DEVICES.filter(device => device.kind.includes("input")),
    "deep equals input media devices"
  );

  t.deepEquals(
    utils.mediaDevice.mediaDeviceInfoFilters.filterAudioInputDevices(
      MOCK_MEDIA_DEVICES
    ),
    MOCK_MEDIA_DEVICES.filter(device => device.kind.includes("audioinput")),
    "deep equals audio input devices"
  );

  t.deepEquals(
    utils.mediaDevice.mediaDeviceInfoFilters.filterVideoInputDevices(
      MOCK_MEDIA_DEVICES
    ),
    MOCK_MEDIA_DEVICES.filter(device => device.kind.includes("videoinput")),
    "deep equals video input devices"
  );

  t.deepEquals(
    utils.mediaDevice.mediaDeviceInfoFilters.filterOutputMediaDevices(
      MOCK_MEDIA_DEVICES
    ),
    MOCK_MEDIA_DEVICES.filter(device => device.kind.includes("output")),
    "deep equals output media devices"
  );

  t.deepEquals(
    utils.mediaDevice.mediaDeviceInfoFilters.filterAudioOutputDevices(
      MOCK_MEDIA_DEVICES
    ),
    MOCK_MEDIA_DEVICES.filter(device => device.kind.includes("audiooutput")),
    "deep equals audio output devices"
  );

  t.deepEquals(
    utils.mediaDevice.mediaDeviceInfoFilters.filterVideoOutputDevices(
      MOCK_MEDIA_DEVICES
    ),
    MOCK_MEDIA_DEVICES.filter(device => device.kind.includes("videooutput")),
    "deep equals video output devices"
  );

  t.end();
});

test("utils.mediaDevice.getMatchedMediaDevice", t => {
  t.plan(8);

  t.throws(
    () => {
      utils.mediaDevice.getMatchedMediaDevice(
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
      utils.mediaDevice.getMatchedMediaDevice(
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
    utils.mediaDevice.getMatchedMediaDevice(
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
    utils.mediaDevice.getMatchedMediaDevice(
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
    utils.mediaDevice.getMatchedMediaDevice(
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
    utils.mediaDevice.getMatchedMediaDevice(
      "audioinput",
      {
        label: undefined,
      },
      MOCK_MEDIA_DEVICES
    ),
    undefined,
    "no match on undefined label"
  );

  t.deepEquals(
    utils.mediaDevice.getMatchedMediaDevice(
      "audioinput",
      {
        label: "some-unknown-label",
      },
      MOCK_MEDIA_DEVICES
    ),
    undefined,
    "no match on unknown label"
  );

  t.deepEquals(
    utils.mediaDevice.getMatchedMediaDevice(
      "audioinput",
      {},
      MOCK_MEDIA_DEVICES
    ),
    undefined,
    "no match on no previous info"
  );

  t.end();
});

test("utils.mediaDevice.getIsSameMediaDevice", t => {
  t.plan(16);

  t.throws(
    () =>
      utils.mediaDevice.getIsSameMediaDevice(
        MOCK_MEDIA_DEVICES[0],
        MOCK_MEDIA_DEVICES[0],
        "fake-kind"
      ),
    ReferenceError,
    "throws ReferenceError if using invalid enforcedKind"
  );

  t.notOk(
    utils.mediaDevice.getIsSameMediaDevice(null, MOCK_MEDIA_DEVICES[0]),
    "returns false if deviceA is null"
  );

  t.notOk(
    utils.mediaDevice.getIsSameMediaDevice(MOCK_MEDIA_DEVICES[0], null),
    "returns false if deviceB is null"
  );

  t.notOk(
    utils.mediaDevice.getIsSameMediaDevice(null, null, "videoinput"),
    "returns false if deviceA and deviceB are null while enforcedType is set to valid type"
  );

  t.throws(
    () => utils.mediaDevice.getIsSameMediaDevice(false, MOCK_MEDIA_DEVICES[0]),
    TypeError,
    "throws TypeError if using non-object value for deviceA"
  );

  t.throws(
    () => utils.mediaDevice.getIsSameMediaDevice(MOCK_MEDIA_DEVICES[0], true),
    TypeError,
    "throws TypeError if using non-object value for deviceB"
  );

  t.throws(
    () => utils.mediaDevice.getIsSameMediaDevice(false, true, "audioinput"),
    TypeError,
    "throws TypeError if using non-object value for deviceA and deviceB while enforcedType is set to valid type"
  );

  t.ok(
    utils.mediaDevice.getIsSameMediaDevice(
      MOCK_MEDIA_DEVICES[0],
      MOCK_MEDIA_DEVICES[0]
    ),
    "returns true if identical mock devices are used"
  );

  t.ok(
    utils.mediaDevice.getIsSameMediaDevice(
      MOCK_MEDIA_DEVICES[0],
      MOCK_MEDIA_DEVICES[0],
      null
    ),
    "returns true if identical mock devices are used and null is specified as enforcedKind"
  );

  t.ok(
    utils.mediaDevice.getIsSameMediaDevice(
      MOCK_MEDIA_DEVICES[0],
      MOCK_MEDIA_DEVICES[0],
      "audioinput"
    ),
    "returns true if identical mock devices are used and are the correct enforcedKind"
  );

  t.notOk(
    utils.mediaDevice.getIsSameMediaDevice(
      MOCK_MEDIA_DEVICES[0],
      MOCK_MEDIA_DEVICES[0],
      "videoinput"
    ),
    "returns false if identical mock devices are used but are not the correct enforcedKind"
  );

  t.notOk(
    utils.mediaDevice.getIsSameMediaDevice(
      MOCK_MEDIA_DEVICES[0],
      MOCK_MEDIA_DEVICES[1]
    ),
    "returns false if different mock devices"
  );

  t.notOk(
    utils.mediaDevice.getIsSameMediaDevice(
      { ...MOCK_MEDIA_DEVICES[0], ...{ kind: undefined } },
      { ...MOCK_MEDIA_DEVICES[0], ...{ kind: undefined } },
      "audioinput"
    ),
    "returns false if both compared devices do not have a reference kind"
  );

  t.notOk(
    utils.mediaDevice.getIsSameMediaDevice(MOCK_MEDIA_DEVICES[0], {
      deviceId: "default",
    }),
    "returns false if no available device kind for deviceA"
  );

  t.notOk(
    utils.mediaDevice.getIsSameMediaDevice(
      {
        deviceId: "default",
      },
      MOCK_MEDIA_DEVICES[0]
    ),
    "returns false if no available device kind for deviceB"
  );

  t.ok(
    utils.mediaDevice.getIsSameMediaDevice(
      {
        deviceId: "default",
      },
      MOCK_MEDIA_DEVICES[0],
      "audioinput"
    ),
    "returns true if enforcedKind is audioinput with only deviceId otherwise being set for deviceA"
  );

  t.end();
});

test("utils.mediaDevice.getMediaDeviceTrackControllers", t => {
  t.plan(2);

  t.throws(
    () => {
      utils.mediaDevice.getMediaDeviceTrackControllers({ label: test });
    },
    ReferenceError,
    "throws ReferenceError when no deviceId is set"
  );

  t.deepEquals(
    utils.mediaDevice.getMediaDeviceTrackControllers({
      deviceId: "test",
    }),
    [],
    "matches empty array for controllers with device id of test"
  );

  // NOTE: At this time, it may be nearly impossible to automatically test this
  // function completely works, so refer to dev UI for manual testing

  t.end();
});

test("utils.mediaDevice.getIsMediaDeviceBeingCaptured", t => {
  t.plan(2);

  t.throws(
    () => {
      utils.mediaDevice.getIsMediaDeviceBeingCaptured({ label: test });
    },
    ReferenceError,
    "throws ReferenceError when no deviceId is set"
  );

  t.equals(
    utils.mediaDevice.getIsMediaDeviceBeingCaptured({
      deviceId: "test",
    }),
    false,
    "test device id is not reported as being captured"
  );

  // NOTE: At this time, it may be nearly impossible to automatically test this
  // function completely works, so refer to dev UI for manual testing

  t.end();
});

test("utils.mediaDevice.uncaptureSpecificMediaDevice", async t => {
  t.plan(2);

  // NOTE: t.throws doesn't seem to be working correct when using async
  // methods, so this try / catch is used as a workaround
  try {
    await utils.mediaDevice.uncaptureSpecificMediaDevice({
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
    await utils.mediaDevice.uncaptureSpecificMediaDevice({
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
