# Phantom MediaStream Controller

TODO: Add screenshot capability
TODO: Add ability to select default device (probably need to use labels as deviceId is not consistent across refresh; maybe take a score of everything and the highest match is the same device)

TODO: Describe a bit better

- Captures device audio / video / screenshare
- Wraps audio streams with methods to control gain (volume) and mute, directly on the stream itself

## Troubleshooting

Mac

gyp: No Xcode or CLT version detected!

bash```
$ sudo xcode-select --reset
```
