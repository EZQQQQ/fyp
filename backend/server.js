// /backend/server.js

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectToDatabase = require("./db");
const userRoutes = require("./routers/User");
const communityRoutes = require("./routers/Community");
const questionRoutes = require("./routers/Question");
const answerRoutes = require("./routers/Answer");
const commentRoutes = require("./routers/Comment");
const voteRoutes = require("./routers/Vote");
const pollRoutes = require("./routers/Poll");
const errorHandler = require("./middlewares/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Connect to Database
connectToDatabase();

// CORS Configuration
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const allowedOrigins = CLIENT_ORIGIN.split(",").map((origin) => origin.trim());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Origin ${origin} not allowed by CORS`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
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
app.use("/api/user", userRoutes);
app.use("/api/answer", answerRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/question", questionRoutes);
app.use("/api", voteRoutes);
app.use("/api/poll", pollRoutes);

// Removed the local file serving line
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
    },
  },
  apis: ["./routers/*.js"],
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
