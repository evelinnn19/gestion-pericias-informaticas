const express = require("express");
const router = express.Router();
const estadoCausaController = require("../../controllers/picklists/estadoCausaController");

router.get("/", estadoCausaController.getAll);

module.exports = router;
