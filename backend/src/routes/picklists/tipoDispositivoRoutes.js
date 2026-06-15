const express = require("express");
const router = express.Router();
const tipoDispositivoController = require("../../controllers/picklists/tipoDispositivoController");

router.get("/", tipoDispositivoController.getAll);

module.exports = router;
