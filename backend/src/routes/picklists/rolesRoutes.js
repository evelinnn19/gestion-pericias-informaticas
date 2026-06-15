const express = require("express");
const router = express.Router();
const rolesController = require("../../controllers/picklists/rolesController");

router.get("/", rolesController.getAll);

module.exports = router;
