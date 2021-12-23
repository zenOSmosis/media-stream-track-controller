/**
 * Form video capture constraints, merging optional user constraints onto
 * internal default constraints.
 *
 * @param {MediaTrackConstraints | Object} userConstraints? [default = {}]
 * @return {MediaTrackConstraints | Object}
 */
module.exports = function makeVideoConstraints(userConstraints = {}) {
  const DEFAULT_VIDEO_CONSTRAINTS = {
    video: true,
  };

  return mergeConstraints(DEFAULT_VIDEO_CONSTRAINTS, userConstraints);
};
