const express = require('express');
const cors = require('cors');
require('dotenv').config();
const setupSwagger = require('./src/config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

const rolesRoutes = require("./src/routes/picklists/rolesRoutes");
const tipoDelitoRoutes = require("./src/routes/picklists/tipoDelitoRoutes");
const estadoCausaRoutes = require("./src/routes/picklists/estadoCausaRoutes");
const estadoOperativoRoutes = require("./src/routes/picklists/estadoOperativoRoutes");
const tipoDispositivoRoutes = require("./src/routes/picklists/tipoDispositivoRoutes");
const usuariosRoutes = require("./src/routes/usuariosRoutes");
const personaRoutes = require("./src/routes/personaRoutes");
const causaRoutes = require("./src/routes/causaRoutes");
const autoRoutes = require("./src/routes/autoRoutes");
const autoPersonaRoutes = require("./src/routes/autoPersonaRoutes");
const oficioRoutes = require("./src/routes/oficioRoutes");
const actaAperturaRoutes = require("./src/routes/actaAperturaRoutes");
const oficioPeritoRoutes = require("./src/routes/oficioPeritoRoutes");
const informeRoutes = require("./src/routes/informeRoutes");
const dispositivoRoutes = require("./src/routes/dispositivoRoutes");
const oficioDispositivoRoutes = require("./src/routes/oficioDispositivoRoutes");
const notaTecnicaRoutes = require("./src/routes/notaTecnicaRoutes");
const historialEstadoCausaRoutes = require("./src/routes/historialEstadoCausaRoutes");

// Middlewares
app.use(cors());
app.use(express.json());

// Setup Swagger UI
setupSwagger(app);

/**
 * @swagger
 * /api/ping:
 *   get:
 *     summary: Verifica si el servidor está en línea
 *     description: Retorna un mensaje 'pong' y la fecha actual si el servidor está funcionando correctamente.
 *     responses:
 *       200:
 *         description: Conexión exitosa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date() });
});


app.use("/api/picklists/roles", rolesRoutes);
app.use("/api/picklists/tipodelito", tipoDelitoRoutes);
app.use("/api/picklists/estadocausa", estadoCausaRoutes);
app.use("/api/picklists/estadooperativo", estadoOperativoRoutes);
app.use("/api/picklists/tipodispositivo", tipoDispositivoRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/persona", personaRoutes);
app.use("/api/causa", causaRoutes);
app.use("/api/auto", autoRoutes);
app.use("/api/autopersona", autoPersonaRoutes);
app.use("/api/oficio", oficioRoutes);
app.use("/api/actaapertura", actaAperturaRoutes);
app.use("/api/oficioperito", oficioPeritoRoutes);
app.use("/api/informe", informeRoutes);
app.use("/api/dispositivo", dispositivoRoutes);
app.use("/api/oficiodispositivo", oficioDispositivoRoutes);
app.use("/api/notatecnica", notaTecnicaRoutes);
app.use("/api/historialestadocausa", historialEstadoCausaRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
