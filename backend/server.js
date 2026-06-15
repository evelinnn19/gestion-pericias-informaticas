const express = require('express');
const cors = require('cors');
require('dotenv').config();
const setupSwagger = require('./src/config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

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


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
