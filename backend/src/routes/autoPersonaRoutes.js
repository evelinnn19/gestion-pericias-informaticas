const express = require("express");
const router = express.Router();
const autoPersonaController = require("../controllers/autoPersonaController");

router.get("/", autoPersonaController.getAll);
router.post("/", autoPersonaController.create);
router.delete("/:idAuto/:idPersona", autoPersonaController.remove);

module.exports = router;
