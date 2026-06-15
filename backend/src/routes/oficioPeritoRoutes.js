const express = require("express");
const router = express.Router();
const oficioPeritoController = require("../controllers/oficioPeritoController");

router.get("/", oficioPeritoController.getAll);
router.post("/", oficioPeritoController.create);
router.delete("/:idOficio/:idPerito", oficioPeritoController.remove);

module.exports = router;
