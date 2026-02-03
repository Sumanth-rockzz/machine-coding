const service = require("../services/key.services");

exports.createKey = (req, res) => {
  const keyId = service.createKey();
  res.status(201).json({ keyId });
};

exports.getAvailableKey = (req, res) => {
  const keyId = service.assignKey();
  if (!keyId) return res.sendStatus(404);
  res.json({ keyId });
};

exports.getKeyInfo = (req, res) => {
  const key = service.getKey(req.params.id);
  if (!key) return res.sendStatus(404);
  res.json(key);
};

exports.unblockKey = (req, res) => {
  if (!service.unblockKey(req.params.id)) return res.sendStatus(404);
  res.sendStatus(200);
};

exports.deleteKey = (req, res) => {
  if (!service.deleteKey(req.params.id)) return res.sendStatus(404);
  res.sendStatus(200);
};

exports.keepAlive = (req, res) => {
  if (!service.keepAlive(req.params.id)) return res.sendStatus(404);
  res.sendStatus(200);
};
