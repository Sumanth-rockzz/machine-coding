const express = require("express");
const controller = require("../controllers/key.controller");

const router = express.Router();

router.post("/keys", controller.createKey);
router.get("/keys", controller.getAvailableKey);
router.get("/keys/:id", controller.getKeyInfo);
router.put("/keys/:id", controller.unblockKey);
router.delete("/keys/:id", controller.deleteKey);
router.put("/keepalive/:id", controller.keepAlive);

module.exports = router;
