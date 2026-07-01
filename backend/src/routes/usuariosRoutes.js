const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");

// GET /api/usuarios/perfil?correo=xxx
// Devuelve el perfil y el rol del usuario autenticado desde el frontend con Supabase Auth
router.get("/perfil", usuariosController.getPerfil);

// GET /api/usuarios/peritos
// Devuelve solo los usuarios con rol 'perito' para poblar el filtro de peritos
router.get("/peritos", usuariosController.getPeritos);

router.get("/", usuariosController.getAll);
router.get("/:id", usuariosController.getById);
router.post("/", usuariosController.create);
router.put("/:id", usuariosController.update);
router.delete("/:id", usuariosController.remove);

module.exports = router;
