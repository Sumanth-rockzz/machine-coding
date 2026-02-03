module.exports = (keys, availableKeys, expiryHeap, blockHeap) => {
  setInterval(() => {
    const now = Date.now();
    while (expiryHeap.peek() && expiryHeap.peek().time <= now) {
      const { keyId } = expiryHeap.pop();
      const key = keys.get(keyId);
      if (key && key.lastKeepAlive + 300000 <= now) {
        keys.delete(keyId);
        availableKeys.delete(keyId);
      }
    }
  }, 1000);

  setInterval(() => {
    const now = Date.now();
    while (blockHeap.peek() && blockHeap.peek().time <= now) {
      const { keyId } = blockHeap.pop();
      const key = keys.get(keyId);
      if (key && key.isBlocked) {
        key.isBlocked = false;
        key.blockedAt = null;
        availableKeys.add(keyId);
      }
    }
  }, 1000);
};
