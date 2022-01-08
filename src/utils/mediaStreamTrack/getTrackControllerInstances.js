const BaseTrackController = require("../../_base/_MediaStreamTrackControllerBase");

/**
 * @return {AudioMediaStreamTrackController[] | VideoMediaStreamTrackController[]}
 */
module.exports = function getTrackControllerInstances() {
  return BaseTrackController.getTrackControllerInstances();
};
