import { useCallback, useEffect, useState } from "react";
import "./App.css";
import {
  MediaStreamTrackControllerFactory,
  MediaStreamTrackControllerEvents,
  utils,
  debug,
} from "./media-stream-controller";
import { MediaStreamTrackAudioLevelMeter } from "./components/AudioLevelMeter";

function App() {
  const [
    mediaStreamTrackControllerFactories,
    setMediaStreamTrackControllerFactories,
  ] = useState([]);

  const initControllerFactory = useCallback((inputMediaStream, title) => {
    setMediaStreamTrackControllerFactories(prev => [
      ...prev,
      new MediaStreamTrackControllerFactory(inputMediaStream, { title }),
    ]);
  }, []);

  // Sync mediaStreamTrackControllerFactories once a factory has been destroyed
  useEffect(() => {
    const handleUpdate = () =>
      setMediaStreamTrackControllerFactories(
        MediaStreamTrackControllerFactory.getFactoryInstances()
      );

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

    initControllerFactory(mediaStream, "pulsatingAudio");
  }, [initControllerFactory]);

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
          <h2>Media Device Capture</h2>
          <div>
            <button
              onClick={() =>
                utils
                  .fetchMediaDevices()
                  .then(devices => alert(JSON.stringify(devices)))
              }
            >
              utils.fetchMediaDevices() [aggressive]
            </button>
            <button
              onClick={() =>
                utils
                  .fetchMediaDevices(false)
                  .then(devices => alert(JSON.stringify(devices)))
              }
            >
              utils.fetchMediaDevices() [non-aggressive]
            </button>
          </div>
        </div>
        <div>
          <button
            onClick={() =>
              utils
                .captureDeviceMedia()
                .then(mediaStream =>
                  initControllerFactory(mediaStream, "captureDeviceMedia")
                )
            }
          >
            utils.captureDeviceMedia() => new
            MediaStreamTrackControllerFactory()
          </button>
          <div style={{ border: "1px #ccc solid", margin: 5 }}>
            <h2>Screen Capture</h2>
            {/**
              <button onClick={() => utils.captureScreen()}>
                utils.captureScreen()
              </button>   
               */}
            <button
              onClick={() =>
                utils
                  .captureScreen()
                  .then(mediaStream =>
                    initControllerFactory(mediaStream, "captureScreen")
                  )
              }
            >
              utils.captureScreen() => new MediaStreamTrackControllerFactory()
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
        }
      }
    })();
  }, [trackController, videoEl]);

  return (
    <div style={{ display: "inline-block" }}>
      <video
        muted={true}
        ref={setVideoEl}
        controls={true}
        width={300}
        height={300}
      />
      {trackController.getTrackKind() === "audio" && (
        <div>
          <MediaStreamTrackAudioLevelMeter
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
