const express = require("express");
const router = express.Router();
const rolesController = require("../../controllers/picklists/rolesController");

/**
 * @swagger
 * /api/picklists/roles:
 *   get:
 *     summary: Obtiene la lista completa de roles
 *     description: Retorna un arreglo con todos los roles disponibles en el sistema para usar en listas desplegables (picklists).
 *     tags:
 *       - Picklists - Roles
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idrol:
 *                     type: integer
 *                     description: Identificador único del rol.
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     description: Nombre descriptivo del rol.
 *                     example: "Administrador"
 *       400:
 *         description: Error en la consulta a la base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al consultar la base de datos."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor."
 */
router.get("/", rolesController.getAll);

module.exports = router;