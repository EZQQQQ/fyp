// /backend/server.js

// Load environment variables first
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const connectToDatabase = require("./db");
const userRoutes = require("./routers/User");
const communityRoutes = require("./routers/Community");
const questionRoutes = require("./routers/Question");
const answerRoutes = require("./routers/Answer");
const commentRoutes = require("./routers/Comment");
const voteRoutes = require("./routers/Vote");
const errorHandler = require("./middlewares/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Connect to Database
connectToDatabase();

// CORS Configuration
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// Parse multiple origins if provided
const allowedOrigins = CLIENT_ORIGIN.split(",").map((origin) => origin.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`Origin ${origin} not allowed by CORS`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(
    `Incoming Request: ${req.method} ${req.url} from Origin: ${req.headers.origin}`
  );
  next();
});

// API Routes
app.use("/api/user", userRoutes); // User routes
app.use("/api/answer", answerRoutes); // Answer routes
app.use("/api/comment", commentRoutes); // Comment routes
app.use("/api/communities", communityRoutes); // Community routes
app.use("/api/question", questionRoutes); // Mount Question routes under /api/question
app.use("/api", voteRoutes); // Vote routes

// Serve Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
    },
  },
  apis: ["./routers/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
