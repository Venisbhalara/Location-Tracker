const express = require("express");
const router = express.Router();
const { subscribePush, pingUser } = require("../controllers/pushController");

// POST /api/push/subscribe — Target user subscribes to background pings
router.post("/subscribe", subscribePush);

// POST /api/push/ping      — Admin triggers a ping
router.post("/ping", pingUser);

module.exports = router;
