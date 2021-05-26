// TODO: Incorporate into this project

import { useCallback } from "react";

/**
 * Source code idea borrowed from:
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
 *
 * For the future (fun with filters):
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos#fun_with_filters
 */
export default function useVideoMediaStreamTrackSnapshot() {
  const takeSnapshot = useCallback(async videoMediaStreamTrack => {
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
    console.log({
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
