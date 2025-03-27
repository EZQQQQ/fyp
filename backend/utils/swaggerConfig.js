// /backend/utils/swaggerConfig.js

const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Title",
      version: "1.0.0",
      description: "API documentation for backend",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Adjust the glob path relative to this file
  apis: [path.join(__dirname, "../routers/*.js")],
};

const swaggerSpec = swaggerJSDoc(options);

// console.log("Swagger paths:", JSON.stringify(swaggerSpec.paths, null, 2));

module.exports = { swaggerSpec, swaggerUi };
