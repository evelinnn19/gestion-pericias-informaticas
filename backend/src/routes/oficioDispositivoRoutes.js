const express = require("express");
const router = express.Router();
const oficioDispositivoController = require("../controllers/oficioDispositivoController");

router.get("/", oficioDispositivoController.getAll);
router.post("/", oficioDispositivoController.create);
router.delete("/:idOficio/:idDispositivo", oficioDispositivoController.remove);

module.exports = router;
