/**
 * Prototype React application for debugging media-stream-track-controller
 * tools.
 *
 * This tool is intended to be utilized for manual testing and debugging of the
 * media-stream-track-controller library across multiple devices where
 * automated testing is not fully implemented.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  MediaStreamTrackControllerFactory,
  MediaStreamTrackControllerFactoryCollection,
  MediaStreamTrackControllerCollection,
  utils,
} from "./media-stream-track-controller";
import { AudioMediaStreamTrackLevelMeter } from "./components/AudioLevelMeter";
import { logger } from "phantom-core";

import useArrayDiff from "./hooks/useArrayDiff";
import useForceUpdate from "./hooks/useForceUpdate";

function App() {
  const masterMuteController = useMemo(
    () => new MediaStreamTrackControllerFactoryCollection(),
    []
  );

  const [
    mediaStreamTrackControllerFactories,
    setMediaStreamTrackControllerFactories,
  ] = useState([]);

  const [mediaDevices, setMediaDevices] = useState([]);
  const [inputMediaDevices, setInputMediaDevices] = useState([]);
  const [outputMediaDevices, setOutputMediaDevices] = useState([]);

  const [audioMediaStreamTracks, setAudioMediaStreamTracks] = useState([]);
  const [audioTrackControllers, setAudioTrackControllers] = useState([]);

  // const [videoMediaStreamTracks, setVideoMediaStreamTracks] = useState([]);
  const [videoTrackControllers, setVideoTrackControllers] = useState([]);

  // Determine all  media stream tracks / controllers and add them to the state
  useEffect(() => {
    const audioTrackControllers = mediaStreamTrackControllerFactories
      .map(factory => factory.getAudioTrackControllers())
      .flat();

    const audioMediaStreamTracks = audioTrackControllers.map(controller =>
      controller.getOutputTrack()
    );

    const videoTrackControllers = mediaStreamTrackControllerFactories
      .map(factory => factory.getVideoTrackControllers())
      .flat();

    /*
    const videoMediaStreamTracks = videoTrackControllers.map(controller =>
      controller.getOutputTrack()
    );
    */

    setAudioMediaStreamTracks(audioMediaStreamTracks);
    setAudioTrackControllers(audioTrackControllers);

    // setVideoMediaStreamTracks(videoMediaStreamTracks);
    setVideoTrackControllers(videoTrackControllers);
  }, [mediaStreamTrackControllerFactories]);

  // Determine input / output media devices and add them to the state
  useEffect(() => {
    setInputMediaDevices(
      utils.mediaDevice.mediaDeviceInfoFilters.filterInputMediaDevices(
        mediaDevices
      )
    );

    setOutputMediaDevices(
      utils.mediaDevice.mediaDeviceInfoFilters.filterOutputMediaDevices(
        mediaDevices
      )
    );
  }, [mediaDevices]);

  /**
   * Registers controller factory w/ UI component state.
   *
   * @param {MediaStreamTrackControllerFactory} controllerFactory
   * @return {void}
   */
  const registerControllerFactory = useCallback(
    controllerFactory => {
      logger.log("registering controller factory", {
        controllerFactory,
      });

      masterMuteController.addChild(controllerFactory);

      setMediaStreamTrackControllerFactories(prev => [
        ...prev,
        controllerFactory,
      ]);
    },
    [masterMuteController]
  );

  // Sync mediaStreamTrackControllerFactories once a factory has been destroyed
  useEffect(() => {
    const handleUpdate = () => {
      const factoryInstances =
        MediaStreamTrackControllerFactory.getFactoryInstances();

      logger.log("updating registered controller factory instances", {
        factoryInstances,
      });

      setMediaStreamTrackControllerFactories(factoryInstances);
    };

    mediaStreamTrackControllerFactories.forEach(controller => {
      controller.once(
        MediaStreamTrackControllerFactory.EVT_DESTROYED,
        handleUpdate
      );

      controller.on(
        MediaStreamTrackControllerFactory.EVT_UPDATED,
        handleUpdate
      );
    });

    return function unmount() {
      mediaStreamTrackControllerFactories.forEach(controller => {
        controller.off(
          MediaStreamTrackControllerFactory.EVT_DESTROYED,
          handleUpdate
        );

        controller.off(
          MediaStreamTrackControllerFactory.EVT_UPDATED,
          handleUpdate
        );
      });
    };
  }, [mediaStreamTrackControllerFactories]);

  const createPulsatingAudio = useCallback(() => {
    const mediaStream =
      utils.mediaStream.generators.createTestAudioMediaStream();

    registerControllerFactory(
      new MediaStreamTrackControllerFactory(mediaStream, {
        title: "Pulsating Audio",
      })
    );
  }, [registerControllerFactory]);

  return (
    <div className="App">
      <div>
        <h1>Utils</h1>
        <div style={{ border: "1px #ccc solid", margin: 5 }}>
          <h2>Audio Context</h2>
          <button
            onClick={() => alert(utils.audioContext.getSharedAudioContext())}
          >
            utils.audioContext.getSharedAudioContext()
          </button>
        </div>
        <div style={{ border: "1px #ccc solid", margin: 5 }}>
          <h2>Media Devices</h2>
          {[
            {
              name: "utils.mediaDevice.fetchMediaDevices [aggressive]",
              cb: () =>
                utils.mediaDevice
                  .fetchMediaDevices()
                  .then(devices => setMediaDevices(devices)),
            },
            //
            {
              name: "utils.mediaDevice.fetchMediaDevices [non-aggressive]",
              cb: () =>
                utils.mediaDevice
                  .fetchMediaDevices(false)
                  .then(devices => setMediaDevices(devices)),
            },
            //
            {
              name: "utils.mediaDevice.captureMediaDevice()",
              cb: () =>
                utils.mediaDevice
                  .captureMediaDevice(null, {
                    title: "captureMediaDevice",
                  })
                  .then(registerControllerFactory),
            },
            {
              name: "utils.mediaDevice.captureMediaDevice() (with video)",
              cb: () =>
                utils.mediaDevice
                  .captureMediaDevice(
                    { video: true },
                    {
                      title: "captureMediaDevice-with-video",
                    }
                  )
                  .then(registerControllerFactory),
            },
          ].map(({ name, cb }, idx) => (
            <div key={idx}>
              <button onClick={cb}>{name}</button>
            </div>
          ))}
        </div>
        <div>
          {inputMediaDevices.length > 0 && (
            <div>
              <h3>Input Media Devices</h3>
              {inputMediaDevices.map((device, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: "left",
                    border: "1px #000 solid",
                    overflow: "auto",
                    padding: 8,
                    backgroundColor: idx % 2 ? "#ccc" : "#fff",
                  }}
                >
                  {device.kind} {device.label}
                  <button
                    style={{ float: "right" }}
                    onClick={() => {
                      if (
                        window.confirm(
                          "CAUTION: The capture will immediately begin playing audio or video and can introduce enormous feedback with audio."
                        )
                      ) {
                        utils.mediaDevice
                          .captureSpecificMediaDevice(device, null, {
                            title: device.label,
                          })
                          .then(registerControllerFactory);
                      }
                    }}
                  >
                    Capture
                  </button>
                </div>
              ))}
            </div>
          )}

          {outputMediaDevices.length > 0 && (
            <div>
              <h3>Output Media Devices</h3>
              {outputMediaDevices.map((device, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: "left",
                    border: "1px #000 solid",
                    overflow: "auto",
                    padding: 8,
                    backgroundColor: idx % 2 ? "#ccc" : "#fff",
                  }}
                >
                  {device.kind} {device.label}
                </div>
              ))}
            </div>
          )}

          <div style={{ border: "1px #ccc solid", margin: 5 }}>
            <h2>Screen Capture</h2>
            <button
              onClick={() =>
                utils.screen
                  .captureScreen(null, {
                    title: "captureScreen",
                  })
                  .then(registerControllerFactory)
              }
            >
              utils.screen.captureScreen()
            </button>
            <button
              onClick={() => alert(utils.screen.getIsScreenCaptureSupported())}
            >
              utils.screen.getIsScreenCaptureSupported()
            </button>
          </div>
        </div>
      </div>

      <div>
        <h1>Debug</h1>
        <div>
          <h2>Pulsating Audio</h2>
          <button onClick={() => createPulsatingAudio()}>
            createPulsatingAudio()
          </button>
        </div>
      </div>

      <div style={{ borderTop: "4px #000 solid" }}>
        {mediaStreamTrackControllerFactories.map((factory, idx) => {
          return (
            <div key={idx} style={{ border: "1px #ccc solid" }}>
              <div style={{ margin: 8, fontWeight: "bold" }}>
                Factory: {factory.getTitle() || "[Untitled]"}{" "}
                <button onClick={() => factory.destroy()}>Destroy</button>
              </div>

              <div>
                {factory.getTrackControllers().map((controller, idx) => (
                  <MediaElement
                    key={idx}
                    trackController={controller}
                    inputMediaDevices={inputMediaDevices}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ border: "1px #ccc solid", margin: 8, padding: 8 }}>
        <h2>Master Audio Muting</h2>
        <div>
          <button
            onClick={() => masterMuteController.muteAudio()}
            disabled={masterMuteController.getIsAudioMuted()}
          >
            Mute
          </button>{" "}
          <button
            onClick={() => masterMuteController.unmuteAudio()}
            disabled={!masterMuteController.getIsAudioMuted()}
          >
            Unmute
          </button>
        </div>
      </div>

      <div style={{ border: "1px #ccc solid", margin: 8, padding: 8 }}>
        <h2>Mixed Audio Level</h2>
        <AudioMediaStreamTrackLevelMeter
          mediaStreamTracks={audioMediaStreamTracks}
          style={{ height: 100 }}
        />
      </div>

      <div style={{ border: "1px #ccc solid", margin: 8, padding: 8 }}>
        <h2>Combined Audio Collection</h2>
        <TrackControllerCollectionView
          name="audio"
          trackControllers={audioTrackControllers}
          inputMediaDevices={inputMediaDevices}
        />
      </div>

      <div style={{ border: "1px #ccc solid", margin: 8, padding: 8 }}>
        <h2>Combined Video Collection</h2>
        <TrackControllerCollectionView
          name="video"
          trackControllers={videoTrackControllers}
          inputMediaDevices={inputMediaDevices}
        />
      </div>
    </div>
  );
}

function TrackControllerCollectionView({
  // name,
  trackControllers,
  inputMediaDevices,
}) {
  const forceUpdate = useForceUpdate();

  const collection = useMemo(() => {
    const collection = new MediaStreamTrackControllerCollection();

    collection.on(
      MediaStreamTrackControllerCollection.EVT_UPDATED,
      forceUpdate
    );

    return collection;
  }, [forceUpdate]);

  // Automatically destruct collection on unmount
  useEffect(() => {
    return function unmount() {
      collection.destroy();
    };
  }, [collection]);

  const { added: addedTrackControllers, removed: removedTrackControllers } =
    useArrayDiff(trackControllers);

  useEffect(() => {
    addedTrackControllers.forEach(controller =>
      collection.addTrackController(controller)
    );

    removedTrackControllers.forEach(controller =>
      collection.removeTrackController(controller)
    );
  }, [collection, addedTrackControllers, removedTrackControllers]);

  return (
    <div>
      <div>
        <button
          onClick={() => collection.mute()}
          disabled={collection.getIsMuted()}
        >
          Mute Collection
        </button>
        <button
          onClick={() => collection.unmute()}
          disabled={!collection.getIsMuted()}
        >
          Unmute Collection
        </button>
      </div>
      {collection.getTrackControllers().map((controller, idx) => (
        <MediaElement
          key={idx}
          trackController={controller}
          inputMediaDevices={inputMediaDevices}
        />
      ))}
    </div>
  );
}

/**
 * Renders UI element for monitoring Audio/VideoMediaStreamTrackController
 * state.
 */
function MediaElement({ trackController, inputMediaDevices }) {
  const [videoEl, setVideoEl] = useState(null);

  useEffect(() => {
    (async () => {
      if (trackController && videoEl) {
        await trackController.onceReady();

        const track = trackController.getOutputTrack();

        if (track) {
          videoEl.srcObject = new MediaStream([track]);

          videoEl.muted = false;
          videoEl.play();

          // Force the UI to scroll to the video element
          videoEl.scrollIntoView();
        }
      }
    })();
  }, [trackController, videoEl]);

  const inputDeviceId = useMemo(
    () => trackController.getInputDeviceId(),
    [trackController]
  );

  /**
   * @return {Object | void}
   */
  const matchedInputMediaDevice = useMemo(() => {
    const match =
      trackController.getInputMediaDeviceInfoFromList(inputMediaDevices);

    if (match) {
      // TODO: This is used to convert to a regular object so we can iterate
      // through the keys using Object.entries.  Perhaps there is a better way
      // of doing this
      return JSON.parse(JSON.stringify(match));
    }
  }, [trackController, inputMediaDevices]);

  return (
    <div
      style={{
        display: "inline-block",
        border: "1px #000 solid",
      }}
    >
      <div
        style={{ backgroundColor: "#000", color: "#fff", textAlign: "left" }}
      >
        <div>
          {!matchedInputMediaDevice ? (
            <div>Input Device ID: {inputDeviceId || "N/A"}</div>
          ) : (
            <div>
              <h3>Matched Input Media Device</h3>
              {Object.entries(matchedInputMediaDevice).map(
                ([key, value], idx) => {
                  return (
                    <div key={idx}>
                      {key}:{" "}
                      {typeof value === "boolean"
                        ? Boolean(value)
                          ? "true"
                          : "false"
                        : value}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div>
          <h3>Input settings</h3>
          {Object.entries(trackController.getSettings()).map(
            ([key, value], idx) => {
              return (
                <div key={idx}>
                  {key}:{" "}
                  {typeof value === "boolean"
                    ? Boolean(value)
                      ? "true"
                      : "false"
                    : value}
                </div>
              );
            }
          )}
        </div>
      </div>

      <div>{trackController.getOutputTrack().readyState}</div>

      <video
        muted={true}
        playsInline={true}
        ref={setVideoEl}
        controls={true}
        width={300}
        height={300}
      />
      {trackController.getTrackKind() === "audio" && (
        <div>
          {
            // TODO: Implement gain adjustment UI controller
          }
          <AudioMediaStreamTrackLevelMeter
            mediaStreamTrack={trackController.getOutputTrack()}
            style={{ height: 100 }}
          />
          <button
            onClick={() => trackController.mute()}
            disabled={trackController.getIsMuted()}
          >
            Mute
          </button>
          <button
            onClick={() => trackController.unmute()}
            disabled={!trackController.getIsMuted()}
          >
            Unmute
          </button>
        </div>
      )}
      <div>
        <button
          disabled={!Boolean(matchedInputMediaDevice)}
          onClick={() =>
            utils.mediaDevice.uncaptureSpecificMediaDevice(
              matchedInputMediaDevice
            )
          }
        >
          Uncapture Device
        </button>
        <button onClick={() => trackController.destroy()}>
          Destruct Controller
        </button>
        <button
          onClick={() =>
            console.log(
              MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
                matchedInputMediaDevice
              )
            )
          }
        >
          Log Device Factories
        </button>
      </div>
    </div>
  );
}

export default App;
