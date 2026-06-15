const express = require("express");
const router = express.Router();
const informeController = require("../controllers/informeController");

router.get("/", informeController.getAll);
router.get("/:id", informeController.getById);
router.post("/", informeController.create);
router.put("/:id", informeController.update);
router.delete("/:id", informeController.remove);

module.exports = router;
