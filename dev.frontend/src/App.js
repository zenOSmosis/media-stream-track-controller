/**
 * Prototype React application for debugging media-stream-track-controller tools.
 */

import { useCallback, useEffect, useState } from "react";
import "./App.css";
import {
  MediaStreamTrackControllerFactory,
  MediaStreamTrackControllerEvents,
  utils,
  debug,
} from "./media-stream-track-controller";
import { AudioMediaStreamTrackLevelMeter } from "./components/AudioLevelMeter";
import { logger } from "phantom-core";

function App() {
  const [
    mediaStreamTrackControllerFactories,
    setMediaStreamTrackControllerFactories,
  ] = useState([]);

  const [inputMediaDevices, setInputMediaDevices] = useState([]);
  const [outputMediaDevices, setOutputMediaDevices] = useState([]);

  /**
   * Registers controller factory w/ UI component state.
   *
   * @param {MediaStreamTrackControllerFactory} controllerFactory
   * @return {void}
   */
  const registerControllerFactory = useCallback(controllerFactory => {
    logger.log("registering controller factory", {
      controllerFactory,
      outputMediaStream: controllerFactory.getOutputMediaStream(),
      outputMediaStreamTracks: controllerFactory
        .getOutputMediaStream()
        .getTracks(),
    });

    setMediaStreamTrackControllerFactories(prev => [
      ...prev,
      controllerFactory,
    ]);
  }, []);

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
        MediaStreamTrackControllerEvents.EVT_DESTROYED,
        handleUpdate
      );

      controller.on(MediaStreamTrackControllerEvents.EVT_UPDATED, handleUpdate);
    });

    return function unmount() {
      mediaStreamTrackControllerFactories.forEach(controller => {
        controller.off(
          MediaStreamTrackControllerEvents.EVT_DESTROYED,
          handleUpdate
        );

        controller.off(
          MediaStreamTrackControllerEvents.EVT_UPDATED,
          handleUpdate
        );
      });
    };
  }, [mediaStreamTrackControllerFactories]);

  const createPulsatingAudio = useCallback(() => {
    const mediaStream = debug.getPulsingAudioMediaStream();

    registerControllerFactory(
      new MediaStreamTrackControllerFactory(mediaStream, "pulsatingAudio")
    );
  }, [registerControllerFactory]);

  return (
    <div className="App">
      <div>
        <h1>Utils</h1>
        <div style={{ border: "1px #ccc solid", margin: 5 }}>
          <h2>Audio Context</h2>
          <button onClick={() => alert(utils.getSharedAudioContext())}>
            utils.getSharedAudioContext()
          </button>
        </div>
        <div style={{ border: "1px #ccc solid", margin: 5 }}>
          <h2>Media Devices</h2>
          {[
            {
              name: "utils.fetchMediaDevices.fetchInputMediaDevices() [aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchInputMediaDevices()
                  .then(devices => setInputMediaDevices(devices)),
            },
            {
              name: "utils.fetchMediaDevices.fetchAudioInputDevices() [aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchAudioInputDevices()
                  .then(devices => setInputMediaDevices(devices)),
            },
            {
              name: "utils.fetchMediaDevices.fetchVideoInputDevices() [aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchVideoInputDevices()
                  .then(devices => setInputMediaDevices(devices)),
            },
            //
            {
              name: "utils.fetchMediaDevices.fetchInputMediaDevices() [non-aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchInputMediaDevices(false)
                  .then(devices => setInputMediaDevices(devices)),
            },
            {
              name: "utils.fetchMediaDevices.fetchAudioInputDevices() [non-aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchAudioInputDevices(false)
                  .then(devices => setInputMediaDevices(devices)),
            },
            {
              name: "utils.fetchMediaDevices.fetchTotalAudioInputDevices() [non-aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchTotalAudioInputDevices(false)
                  .then(totalDevices =>
                    alert(`Total audio input devices: ${totalDevices}`)
                  ),
            },
            {
              name: "utils.fetchMediaDevices.fetchVideoInputDevices() [non-aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchVideoInputDevices(false)
                  .then(devices => setInputMediaDevices(devices)),
            },
            //
            {
              name: "utils.fetchMediaDevices.fetchOutputMediaDevices() [aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchOutputMediaDevices()
                  .then(devices => setOutputMediaDevices(devices)),
            },
            {
              name: "utils.fetchMediaDevices.fetchAudioOutputDevices() [aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchAudioOutputDevices()
                  .then(devices => setOutputMediaDevices(devices)),
            },
            {
              name: "utils.fetchMediaDevices.fetchVideoOutputDevices() [aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchVideoOutputDevices()
                  .then(devices => setOutputMediaDevices(devices)),
            },
            //
            {
              name: "utils.fetchMediaDevices.fetchOutputMediaDevices() [non-aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchOutputMediaDevices(false)
                  .then(devices => setOutputMediaDevices(devices)),
            },
            {
              name: "utils.fetchMediaDevices.fetchAudioOutputDevices() [non-aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchAudioOutputDevices(false)
                  .then(devices => setOutputMediaDevices(devices)),
            },
            {
              name: "utils.fetchMediaDevices.fetchVideoOutputDevices() [non-aggressive]",
              cb: () =>
                utils.fetchMediaDevices
                  .fetchVideoOutputDevices(false)
                  .then(devices => setOutputMediaDevices(devices)),
            },
            {
              name: "utils.captureMediaDevice()",
              cb: () =>
                utils
                  .captureMediaDevice(null, {
                    title: "captureMediaDevice",
                  })
                  .then(registerControllerFactory),
            },
            {
              name: "utils.captureMediaDevice() (with video)",
              cb: () =>
                utils
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
                      utils.captureMediaDevice
                        .captureSpecificMediaDevice(device, null, {
                          title: device.label,
                        })
                        .then(registerControllerFactory);
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
                utils
                  .captureScreen(null, {
                    title: "captureScreen",
                  })
                  .then(registerControllerFactory)
              }
            >
              utils.captureScreen()
            </button>
            <button onClick={() => alert(utils.getIsScreenCaptureSupported())}>
              utils.getIsScreenCaptureSupported()
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
              <div>Factory: {factory.getTitle()}</div>
              {factory.getTrackControllers().map((controller, idx) => (
                <MediaElement key={idx} trackController={controller} />
              ))}
              <div>
                <button onClick={() => factory.destroy()}>Destroy</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Renders UI element for monitoring Audio/VideoMediaStreamTrackController
 * state.
 */
function MediaElement({ trackController }) {
  const [videoEl, setVideoEl] = useState(null);

  useEffect(() => {
    (async () => {
      if (trackController && videoEl) {
        await trackController.onceReady();

        const track = trackController.getOutputMediaStreamTrack();

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

  return (
    <div style={{ display: "inline-block" }}>
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
            mediaStreamTrack={trackController.getOutputMediaStreamTrack()}
            style={{ height: 100 }}
          />
          <button onClick={() => trackController.mute()}>Mute</button>
          <button onClick={() => trackController.unmute()}>Unmute</button>
        </div>
      )}
    </div>
  );
}

export default App;
