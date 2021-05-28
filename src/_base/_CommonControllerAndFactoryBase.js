const PhantomCore = require("phantom-core");
const { EVT_UPDATED, EVT_DESTROYED } = PhantomCore;

/**
 * Base class which MediaStreamTrackControllerBase and
 * MediaStreamTrackControllerFactory extend.
 */
class CommonControllerAndFactoryBase extends PhantomCore {
  constructor(...args) {
    super(...args);

    this._isMuted = false;
  }

  /**
   * @param {boolean} isMuted
   */
  setIsMuted(isMuted) {
    this._isMuted = isMuted;

    this.emit(EVT_UPDATED);
  }

  /**
   * @return {boolean}
   */
  getIsMuted() {
    return this._isMuted;
  }

  mute() {
    this.setIsMuted(true);
  }

  unmute() {
    this.setIsMuted(false);
  }

  /**
   * Sets muting state to alternate state.
   */
  toggleMute() {
    this.setIsMuted(!this._isMuted);
  }

  /**
   * Alias for this.destroy().
   *
   * @return {Promise<void>}
   */
  async stop() {
    return this.destroy();
  }
}

module.exports = CommonControllerAndFactoryBase;
module.exports.EVT_UPDATED = EVT_UPDATED;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
