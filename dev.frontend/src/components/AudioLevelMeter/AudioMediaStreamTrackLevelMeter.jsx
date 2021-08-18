import React from "react";
import AudioLevelMeter from "./AudioLevelMeter";
import useAudioMediaStreamTrackLevelMonitor from "../../hooks/useAudioMediaStreamTrackLevelMonitor";

import PropTypes from "prop-types";

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
  const percent = useAudioMediaStreamTrackLevelMonitor(
    mediaStreamTrack || mediaStreamTracks
  );

  return <AudioLevelMeter percent={percent} {...rest} />;
}
