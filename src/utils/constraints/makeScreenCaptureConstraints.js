/**
 * Form screen capture constraints, merging optional user constraints onto
 * internal default constraints.
 *
 * @param {MediaTrackConstraints | Object} userConstraints? [default = {}]
 * @return {MediaTrackConstraints | Object}
 */
function makeScreenCaptureConstraints(userConstraints = {}) {
  const DEFAULT_CONSTRAINTS = {
    // NOTE: Audio capturing is typically only available in Chromium-based
    // browsers and typically only works for capturing audio in browser tabs.
    //
    // Windows can capture full system audio this way, and Mac can be made to
    // capture full system audio with a third party virtual audio device
    // driver.
    //
    // To enable audio capturing in Chromium-based browsers, the user typically
    // needs to enable it in the UI dialog presented when initiating the screen
    // capture, and is sometimes easy to miss.
    ...makeAudioConstraints(userConstraints && userConstraints.audio),

    // NOTE: Video constraints add cursor capturing capability on top of
    // existing default video constraints, hence why mergeConstraints is used
    // in the createDefaultVideoConstraints argument.
    ...makeVideoConstraints(
      mergeConstraints(
        {
          video: {
            cursor: "always",
          },
        },
        userConstraints && userConstraints.video
      )
    ),
  };

  return mergeConstraints(DEFAULT_CONSTRAINTS, userConstraints);
}
