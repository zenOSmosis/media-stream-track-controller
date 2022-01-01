// TODO: Incorporate into this project

import { useCallback } from "react";
// import { logger } from "phantom-core";
const { VIDEO_TRACK_KIND } = require("../constants");

/**
 * Source code idea borrowed from:
 * @link https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
 *
 * For the future (fun with filters):
 * @link https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos#fun_with_filters
 */
export default function useVideoMediaStreamTrackSnapshot() {
  const takeSnapshot = useCallback(async videoMediaStreamTrack => {
    if (!(videoMediaStreamTrack instanceof MediaStreamTrack)) {
      throw new TypeError(
        "videoMediaStreamTrack is not a MediaStreamTrack instance"
      );
    } else if (videoMediaStreamTrack.kind === VIDEO_TRACK_KIND) {
      throw new TypeError(
        "videoMediaStreamTrack is not a video MediaStreamTrack"
      );
    }

    const { width, height } = videoMediaStreamTrack.getSettings();

    const videoEl = document.createElement("video");
    videoEl.srcObject = new MediaStream([videoMediaStreamTrack]);
    videoEl.width = width;
    videoEl.height = height;

    const canvasEl = document.createElement("canvas");

    await videoEl.play();

    const context = canvasEl.getContext("2d");
    canvasEl.width = width;
    canvasEl.height = height;

    // document.body.appendChild(videoEl);
    // document.body.appendChild(canvasEl);

    context.drawImage(videoEl, 0, 0, width, height);

    const base64 = canvasEl.toDataURL("image/png");

    // TODO: Remove
    /*
    logger.log({
      videoMediaStreamTrack,
      videoEl,
      canvasEl,
      width,
      height,
      base64,
    });
    */

    // document.body.removeChild(videoEl);
    // document.body.removeChild(canvasEl);

    return base64;
  }, []);

  return takeSnapshot;
}
