import { useMemo } from "react";
import { useEffect } from "react/cjs/react.production.min";
import {
  MediaStreamTrackControllerFactory,
  MediaStreamTrackControllerEvents,
  utils,
  debug,
  MultiAudioMediaStreamTrackLevelMonitor,
  MultiAudioMediaStreamTrackLevelMonitorEvents,
} from "./media-stream-track-controller";

// TODO: Implement collection support
export default function useMultiAudioMediaStreamTrackLevelMonitor(
  mediaStreamTrackOrTracks
) {
  // TODO: Implement

  const mediaStreamTracks = useMemo(
    () =>
      Array.isArray(mediaStreamTrackOrTracks)
        ? mediaStreamTrackOrTracks
        : [mediaStreamTrackOrTracks],
    [mediaStreamTrackOrTracks]
  );

  const mediaStreamMonitor = useMemo(
    () => new MultiAudioMediaStreamTrackLevelMonitor(),
    []
  );

  useEffect(() => {}, [mediaStreamTracks]);

  // TODO: Return audio level
}
