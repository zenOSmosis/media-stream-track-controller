[![MIT License][license-image]][license-url]
[![ci][ci-image]][ci-url]
[![CodeQL][codeql-image]][codeql-url]

[license-image]: https://img.shields.io/github/license/zenosmosis/media-stream-track-controller
[license-url]: https://raw.githubusercontent.com/zenOSmosis/media-stream-track-controller/main/LICENSE
[ci-image]: https://github.com/zenosmosis/media-stream-track-controller/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/zenOSmosis/media-stream-track-controller/actions/workflows/ci.yml
[codeql-image]: https://github.com/zenosmosis/media-stream-track-controller/workflows/CodeQL/badge.svg
[codeql-url]: https://github.com/zenOSmosis/media-stream-track-controller/actions/workflows/codeql-analysis.yml

# Phantom MediaStreamTrack Controller

Core audio handling utilities for [Speaker App](https://speaker.app) / [https://github.com/zenOSmosis/speaker.app](https://github.com/zenOSmosis/speaker.app).

## Characteristics

- Extends [PhantomCore](https://github.com/zenOSmosis/phantom-core) with abstracted MediaStreamTrack management
- Included Factory class which accepts a MediaStream and derives child TrackController classes from it, all managed by the factory
- Included utilities for capturing device audio / video / screen, resolving abstracted track controller factory once captured
- Determines list of currently captured media devices
- Track / device association: Track controller class instances can identify device used for capturing
- Wraps audio streams with methods to control gain (volume) and mute, directly on the stream itself
- Includes audio level monitoring: Multiple listeners to same audio tracks are proxied to the original track listener to help free up the CPU

## Testing

Partial automated testing is automated on mobile / desktop devices using SauceLabs.

Other testing is performed manually using included development frontend.

NOTE: Automated testing code coverage is not very good for this package due to a large portion of it not being able to be automated with the current testing setup.

One thing which could help alleviate this would be to be able to capture input devices in the automated test browsers (either by simulating or bypassing required user interaction), and that type of functionality just has not been worked in at this point.

## Development

There is a React-based frontend for prototyping this utility in a browser, which is not to be utilized in a production setting.  It utilizes a Unix symlink to link the dev.frontend/src to the src directory and is therefore not compatible w/ Windows unless running in a WSL terminal (maybe Cygwin could work).

To start the dev frontend:

```bash
$ cd dev.frontend
$ npm run start
```

Then navigate to https://localhost:3000

## Troubleshooting

Mac

gyp: No Xcode or CLT version detected!

```bash
$ sudo xcode-select --reset
```
