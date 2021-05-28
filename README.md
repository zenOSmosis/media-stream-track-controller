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

Work-in-progress / Not recommended for usage at this time

TODO: Add screenshot capability

TODO: Add ability to select default device (probably need to use labels as deviceId is not consistent across refresh; maybe take a score of everything and the highest match is the same device)

TODO: Describe a bit better

- Captures device audio / video / screenshare
- Wraps audio streams with methods to control gain (volume) and mute, directly on the stream itself

## Development

There is a React-based frontend for prototyping this utility in a browser, and is not to be utilized directly in a browser.  It utilizes a Unix symlink to link the dev.frontend to the src directory and is therefore not compatible w/ Windows unless running in a WSL terminal (maybe Cygwin could work).

To start the dev frontend:

```bash
$ cd dev.frontend
$ npm run start
```

Then navigate to https://localhost:3000

## Troubleshooting

Mac

gyp: No Xcode or CLT version detected!

bash```
$ sudo xcode-select --reset
```
