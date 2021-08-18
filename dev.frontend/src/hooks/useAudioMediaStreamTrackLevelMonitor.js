import { useEffect, useMemo, useState } from "react";
import {
  MultiAudioMediaStreamTrackLevelMonitor,
  MultiAudioMediaStreamTrackLevelMonitorEvents,
} from "../media-stream-track-controller";
import usePrevious from "./usePrevious";

const { EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK } =
  MultiAudioMediaStreamTrackLevelMonitorEvents;

/**
 * Utilizes a MultiAudioMediaStreamTrackLevelMonitor as a React hook.
 *
 * @param {MediaStreamTrack | MediaStreamTrack[]} mediaStreamTrackOrTracks A
 * single track, or an array of tracks
 * @return {number} The average RMS of all of the input tracks
 */
export default function useAudioMediaStreamTrackLevelMonitor(
  mediaStreamTrackOrTracks
) {
  const mediaStreamTracks = useMemo(
    () =>
      Array.isArray(mediaStreamTrackOrTracks)
        ? mediaStreamTrackOrTracks
        : [mediaStreamTrackOrTracks],
    [mediaStreamTrackOrTracks]
  );

  const { getPreviousValue: getPreviousMediaStreamTracks } =
    usePrevious(mediaStreamTracks);

  const [mediaStreamMonitor, _setMediaStreamMonitor] = useState(null);

  const [rms, _setRMS] = useState(null);

  useEffect(() => {
    const mediaStreamMonitor = new MultiAudioMediaStreamTrackLevelMonitor();

    // NOTE: This event handler will automatically be unbound once the class
    // destructs
    mediaStreamMonitor.on(EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK, ({ rms }) => {
      // FIXME: This is probably not supposed to be RMS, but it's close
      // enough for prototyping
      _setRMS(rms);
    });

    _setMediaStreamMonitor(mediaStreamMonitor);

    return function unmount() {
      mediaStreamMonitor.destroy();
    };
  }, []);

  // Sync hook's media stream tracks with the audio monitor instance
  useEffect(() => {
    if (mediaStreamMonitor) {
      const prevMediaStreamTracks = getPreviousMediaStreamTracks() || [];

      const removedMediaStreamTracks = prevMediaStreamTracks.filter(
        predicate => !mediaStreamTracks.includes(predicate)
      );

      for (const track of mediaStreamTracks) {
        mediaStreamMonitor.addMediaStreamTrack(track);
      }

      for (const track of removedMediaStreamTracks) {
        mediaStreamMonitor.removeMediaStreamTrack(track);
      }
    }
  }, [mediaStreamMonitor, mediaStreamTracks, getPreviousMediaStreamTracks]);

  return rms;
}
