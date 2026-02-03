const { createKeyModel } = require("../models/key.model");
const store = require("../stores/key.store");
const { EXPIRY_TIME, BLOCK_TIME } = require("../config/constants");

exports.createKey = () => {
  const key = createKeyModel();
  store.save(key);
  return key.id;
};

exports.assignKey = () => {
  return store.assignRandomKey(BLOCK_TIME);
};

exports.getKey = (id) => {
  const key = store.get(id);
  if (!key) return null;

  return {
    isBlocked: key.isBlocked,
    blockedAt: key.blockedAt,
    createdAt: key.createdAt
  };
};

exports.unblockKey = (id) => store.unblock(id);
exports.deleteKey = (id) => store.delete(id);
exports.keepAlive = (id) => store.keepAlive(id, EXPIRY_TIME);
