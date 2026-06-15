const express = require("express");
const router = express.Router();
const notaTecnicaController = require("../controllers/notaTecnicaController");

router.get("/", notaTecnicaController.getAll);
router.get("/:id", notaTecnicaController.getById);
router.post("/", notaTecnicaController.create);
router.put("/:id", notaTecnicaController.update);
router.delete("/:id", notaTecnicaController.remove);

module.exports = router;
