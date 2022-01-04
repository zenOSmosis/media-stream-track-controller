const BaseTrackController = require("../../_base/_MediaStreamTrackControllerBase");

/**
 * @return {AudioMediaStreamTrackController[] | VideoMediaStreamTrackController[]}
 */
module.exports = function getMediaStreamTrackControllerInstances() {
  return BaseTrackController.getMediaStreamTrackControllerInstances();
};
