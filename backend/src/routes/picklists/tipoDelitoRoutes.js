const express = require("express");
const router = express.Router();
const tipoDelitoController = require("../../controllers/picklists/tipoDelitoController");

router.get("/", tipoDelitoController.getAll);

module.exports = router;
