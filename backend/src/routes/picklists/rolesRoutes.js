const express = require("express");
const router = express.Router();
const rolesController = require("../../controllers/picklists/rolesController");

/**
 * @swagger
 * /api/picklists/roles:
 * get:
 * summary: Obtiene la lista completa de roles
 * description: Realiza una consulta a Supabase para traer todos los roles definidos en la base de datos.
 * tags:
 * - Picklists - Roles
 * responses:
 * 200:
 * description: Lista de roles obtenida exitosamente.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * idrol:
 * type: integer
 * example: 1
 * descripcion:
 * type: string
 * example: "Administrador"
 * 400:
 * description: Error en la consulta a la base de datos.
 * 500:
 * description: Error interno del servidor.
 */
router.get("/", rolesController.getAll);

module.exports = router;