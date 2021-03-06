import { useEffect, useMemo, useState } from "react";
import { MultiAudioMediaStreamTrackLevelMonitor } from "../media-stream-track-controller";
import useArrayDiff from "./useArrayDiff";

const { EVT_AUDIO_LEVEL_UPDATED } = MultiAudioMediaStreamTrackLevelMonitor;

/**
 * Utilizes a MultiAudioMediaStreamTrackLevelMonitor as a React hook.
 *
 * @param {MediaStreamTrack | MediaStreamTrack[] | null} mediaStreamTrackOrTracks?
 * [default = []] A single track, or an array of tracks.  It is made optional
 * because rendered audio level meters may not already have an associated
 * MediaStreamTrack.
 * @return {number} The average percent of all of the input tracks.
 */
export default function useAudioMediaStreamTrackLevelMonitor(
  mediaStreamTrackOrTracks = []
) {
  /**
   * @type {MediaStreamTrack[]}
   */
  const mediaStreamTracks = useMemo(
    () =>
      !mediaStreamTrackOrTracks
        ? []
        : Array.isArray(mediaStreamTrackOrTracks)
        ? mediaStreamTrackOrTracks
        : [mediaStreamTrackOrTracks],
    [mediaStreamTrackOrTracks]
  );

  const [mediaStreamMonitor, _setMediaStreamMonitor] = useState(null);

  const [percent, _setPercent] = useState(null);

  useEffect(() => {
    const mediaStreamMonitor = new MultiAudioMediaStreamTrackLevelMonitor();

    // NOTE: This event handler will automatically be unbound once the class
    // destructs
    mediaStreamMonitor.on(EVT_AUDIO_LEVEL_UPDATED, audioLevel => {
      _setPercent(audioLevel);
    });

    _setMediaStreamMonitor(mediaStreamMonitor);

    return function unmount() {
      mediaStreamMonitor.destroy();
    };
  }, []);

  const { added: addedMediaStreamTracks, removed: removedMediaStreamTracks } =
    useArrayDiff(mediaStreamTracks);

  // Sync hook's media stream tracks with the audio monitor instance
  useEffect(() => {
    if (mediaStreamMonitor) {
      // Handle added / existing tracks
      for (const track of addedMediaStreamTracks) {
        mediaStreamMonitor.addMediaStreamTrack(track);
      }

      // Handle removed tracks
      for (const track of removedMediaStreamTracks) {
        mediaStreamMonitor.removeMediaStreamTrack(track);
      }
    }
  }, [mediaStreamMonitor, addedMediaStreamTracks, removedMediaStreamTracks]);

  return percent;
}
