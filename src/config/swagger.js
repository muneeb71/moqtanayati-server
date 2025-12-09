const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Moqtanayati API",
      version: "1.0.0",
      description: "API documentation for Moqtanayati server - Admin access only",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:3001/api",
      },
    ],
    // Security scheme for Bearer token authentication
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.js", "./src/app.js"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
