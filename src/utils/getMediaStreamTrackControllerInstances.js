const BaseTrackController = require("../_base/_MediaStreamTrackControllerBase");

/**
 * @return {AudioMediaStreamTrackController[] | VideoMediaStreamTrackController[]}
 */
function getMediaStreamTrackControllerInstances() {
  return BaseTrackController.getMediaStreamTrackControllerInstances();
}

module.exports = getMediaStreamTrackControllerInstances;
