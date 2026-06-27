const express = require("express");
const router = express.Router();
const oficioController = require("../controllers/oficioController");

// Ruta de listado filtrado — debe ir ANTES de /:id para evitar colisión
router.get("/listado", oficioController.getListado);

router.get("/", oficioController.getAll);
router.get("/:id", oficioController.getById);
router.post("/", oficioController.create);
router.put("/:id", oficioController.update);
router.delete("/:id", oficioController.remove);

module.exports = router;
