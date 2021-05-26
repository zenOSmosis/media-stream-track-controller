const BaseTrackController = require("../_MediaStreamTrackControllerBase");

/**
 * @return {AudioMediaStreamTrackController[] | VideoMediaStreamTrackController[]}
 */
function getMediaStreamTrackControllerInstances() {
  return BaseTrackController.getMediaStreamTrackControllerInstances();
}

module.exports = getMediaStreamTrackControllerInstances;
