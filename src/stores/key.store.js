const MinHeap = require("../utils/minHeap");

const keys = new Map();
const availableKeys = new Set();
const expiryHeap = new MinHeap();
const blockHeap = new MinHeap();

exports.save = (key) => {
  keys.set(key.id, key);
  availableKeys.add(key.id);
  expiryHeap.push({ time: key.lastKeepAlive + 300000, keyId: key.id });
};

exports.assignRandomKey = (blockTime) => {
  if (availableKeys.size === 0) return null;

  const ids = Array.from(availableKeys);
  const keyId = ids[Math.floor(Math.random() * ids.length)];
  const key = keys.get(keyId);

  key.isBlocked = true;
  key.blockedAt = Date.now();
  availableKeys.delete(keyId);
  blockHeap.push({ time: key.blockedAt + blockTime, keyId });

  return keyId;
};

exports.get = (id) => keys.get(id);

exports.unblock = (id) => {
  const key = keys.get(id);
  if (!key) return false;

  key.isBlocked = false;
  key.blockedAt = null;
  availableKeys.add(id);
  return true;
};

exports.delete = (id) => {
  if (!keys.has(id)) return false;
  keys.delete(id);
  availableKeys.delete(id);
  return true;
};

exports.keepAlive = (id, expiryTime) => {
  const key = keys.get(id);
  if (!key) return false;

  key.lastKeepAlive = Date.now();
  expiryHeap.push({ time: key.lastKeepAlive + expiryTime, keyId: id });
  return true;
};

require("../utils/scheduler")(keys, availableKeys, expiryHeap, blockHeap);
