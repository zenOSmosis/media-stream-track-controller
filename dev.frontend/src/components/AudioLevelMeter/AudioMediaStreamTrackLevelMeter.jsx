import React, { useEffect, useState } from "react";
import AudioLevelMeter from "./AudioLevelMeter";
import {
  MultiAudioMediaStreamTrackLevelMonitor,
  MultiAudioMediaStreamTrackLevelMonitorEvents,
} from "../../media-stream-track-controller";
import useAudioMediaStreamTrackLevelMonitor from "../../hooks/useAudioMediaStreamTrackLevelMonitor";

import PropTypes from "prop-types";

const { EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK } =
  MultiAudioMediaStreamTrackLevelMonitorEvents;

AudioMediaStreamTrackLevelMeter.propTypes = {
  /** When multiple audio tracks may be used together */
  mediaStreamTracks: PropTypes.arrayOf(PropTypes.instanceOf(MediaStreamTrack)),

  /** When only a single track is used */
  mediaStreamTrack: PropTypes.instanceOf(MediaStreamTrack),
};

export default function AudioMediaStreamTrackLevelMeter({
  mediaStreamTracks,
  mediaStreamTrack,
  ...rest
}) {
  // const [percent, setPercent] = useState(0);

  const percent = useAudioMediaStreamTrackLevelMonitor(
    mediaStreamTrack || mediaStreamTracks
  );

  // TODO: Use new hook instead of this
  // TODO: Copy final version to Speaker.app
  /*
  useEffect(() => {
    if (mediaStreamTracks) {
      // TODO: Memoize the level monitor and only destruct it when the component unmounts
      const mediaStreamMonitor = new MultiAudioMediaStreamTrackLevelMonitor(
        mediaStreamTracks
      );

      mediaStreamMonitor.on(EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK, ({ rms }) => {
        // FIXME: This is probably not supposed to be RMS, but it's close
        // enough for prototyping
        setPercent(rms);
      });

      return function unmount() {
        mediaStreamMonitor.destroy();
      };
    }
  }, [mediaStreamTracks]);
  */

  return <AudioLevelMeter percent={percent} {...rest} />;
}
