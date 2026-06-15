const express = require("express");
const router = express.Router();
const estadoOperativoController = require("../../controllers/picklists/estadoOperativoController");

router.get("/", estadoOperativoController.getAll);

module.exports = router;
