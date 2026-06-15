const express = require("express");
const router = express.Router();
const causaController = require("../controllers/causaController");

router.get("/", causaController.getAll);
router.get("/:id", causaController.getById);
router.post("/", causaController.create);
router.put("/:id", causaController.update);
router.delete("/:id", causaController.remove);

module.exports = router;
