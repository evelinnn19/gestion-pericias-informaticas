const express = require("express");
const router = express.Router();
const autoController = require("../controllers/autoController");

router.get("/", autoController.getAll);
router.get("/:id", autoController.getById);
router.post("/", autoController.create);
router.put("/:id", autoController.update);
router.delete("/:id", autoController.remove);

module.exports = router;
