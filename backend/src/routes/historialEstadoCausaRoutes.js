const express = require("express");
const router = express.Router();
const historialEstadoCausaController = require("../controllers/historialEstadoCausaController");

router.get("/", historialEstadoCausaController.getAll);
router.get("/:id", historialEstadoCausaController.getById);
router.post("/", historialEstadoCausaController.create);
router.put("/:id", historialEstadoCausaController.update);
router.delete("/:id", historialEstadoCausaController.remove);

module.exports = router;
