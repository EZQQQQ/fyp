// /backend/server.js

// Load environment variables first
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectToDatabase = require('./db');
const PORT = process.env.PORT || 5001;
const router = require("./routers");
const errorHandler = require("./middlewares/errorHandler");

// **Removed GridFS Modules**
// const crypto = require('crypto'); // For generating unique filenames
// const multer = require('multer');
// const { GridFsStorage } = require('multer-gridfs-storage');
// const Grid = require('gridfs-stream');

// Connect to Database
connectToDatabase();

// **Removed GridFS Initialization**
// let gfsQuestions;
// const conn = mongoose.connection;

// conn.once('open', () => {
//   // Initialize stream for questionImages
//   gfsQuestions = Grid(conn.db, mongoose.mongo);
//   gfsQuestions.collection('questionImages');
//   console.log("Connected to MongoDB and GridFS for questionImages initialized.");
// });

// Middleware
app.use(cors()); // CORS should be enabled before defining routes
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// Headers (Optional: Already handled by CORS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// API Routes
app.use("/api", router); // Existing API routes

// Static Resources (if any)
app.use("/uploads", express.static(path.join(__dirname, "/uploads"))); // Ensure consistency

// Serve frontend build
app.use(express.static(path.join(__dirname, "/../frontend/build")));

// Catch-all Route to Serve React Frontend
app.get("*", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "/../frontend/build/index.html"));
  } catch (err) {
    res.status(500).send("Oops! An error occurred");
  }
});

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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
