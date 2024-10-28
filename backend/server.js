// /backend/server.js

// Load environment variables first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const connectToDatabase = require("./db");
const router = require("./routers");
const errorHandler = require("./middlewares/errorHandler");

// Connect to Database
connectToDatabase();

// Middleware

// CORS Configuration
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_ORIGIN, // Allow requests from this origin
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// API Routes
app.use("/api", router); // Existing API routes

// Static Resources (if any)
app.use("/uploads", express.static(path.join(__dirname, "/uploads"))); // Ensure consistency

// Error-Handling Middleware (should be after all other middleware and routes)
app.use(errorHandler);

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
    },
  },
  apis: ["./routers/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Server Listen
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
