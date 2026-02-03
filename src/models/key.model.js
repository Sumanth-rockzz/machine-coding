const { v4: uuidv4 } = require("uuid");

exports.createKeyModel = () => {
  const now = Date.now();
  return {
    id: uuidv4(),
    createdAt: now,
    lastKeepAlive: now,
    isBlocked: false,
    blockedAt: null
  };
};
