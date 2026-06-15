const express = require("express");
const router = express.Router();
const actaAperturaController = require("../controllers/actaAperturaController");

router.get("/", actaAperturaController.getAll);
router.get("/:id", actaAperturaController.getById);
router.post("/", actaAperturaController.create);
router.put("/:id", actaAperturaController.update);
router.delete("/:id", actaAperturaController.remove);

module.exports = router;
