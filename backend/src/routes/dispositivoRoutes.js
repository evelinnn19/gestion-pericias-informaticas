const express = require("express");
const router = express.Router();
const dispositivoController = require("../controllers/dispositivoController");

router.get("/", dispositivoController.getAll);
router.get("/:id", dispositivoController.getById);
router.post("/", dispositivoController.create);
router.put("/:id", dispositivoController.update);
router.delete("/:id", dispositivoController.remove);

module.exports = router;
