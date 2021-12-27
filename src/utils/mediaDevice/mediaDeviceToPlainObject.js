// TODO: Document
module.exports = function mediaDeviceToPlainObject(device) {
  const ret = {};
  for (const prop in device) {
    ret[prop] = device[prop];
  }
  return ret;
};
