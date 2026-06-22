const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestión Pericias Informáticas',
      version: '1.0.0',
      description: 'Documentación de los endpoints del backend.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo',
      },
    ],
  },
  // ACÁ ESTÁ EL CAMBIO CLAVE: **/*.js busca en todas las subcarpetas
  apis: ['./server.js', './src/routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Docs - Gestión Pericias',
  }));
};

module.exports = setupSwagger;