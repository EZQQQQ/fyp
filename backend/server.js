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
const bookmarkRoutes = require("./routers/Bookmark");
const pollRoutes = require("./routers/Poll");
const quizRoutes = require("./routers/Quiz");
const notificationRouter = require("./routers/Notification");
const communityChatRouter = require("./routers/CommunityChat");
const ragRouter = require("./routers/Rag");
const reportRorter = require("./routers/Report");
const errorHandler = require("./middlewares/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Socket.io
const http = require("http");
const socketIo = require("socket.io");
const CommunityChat = require("./models/CommunityChat");
const { RegExpMatcher, TextCensor, englishDataset, englishRecommendedTransformers } = require('obscenity');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

// Keep a map of connected users
const userSockets = new Map();

// Create a matcher and censor instance (you might want to move this outside the connection handler to avoid re-instantiation)
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});
const censor = new TextCensor();


io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // When a client registers their userId
  socket.on("register", (userId) => {
    userSockets.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });

  // Chat events:
  // When a client joins a chat room for a community
  socket.on("joinRoom", ({ communityId, anonymousName }) => {
    socket.join(communityId);
    console.log(`User ${anonymousName} joined community ${communityId}`);
  });

  // When a client leaves a chat room
  socket.on("leaveRoom", ({ communityId, anonymousName }) => {
    socket.leave(communityId);
    console.log(`User ${anonymousName} left community ${communityId}`);
  });

  // When a client sends a chat message
  socket.on("chatMessage", async (messageData) => {
    try {
      // Check for profanity using obscenity
      const matches = matcher.getAllMatches(messageData.content);

      if (matches && matches.length > 0) {
        // If profanity is found, do not save or broadcast.
        // Send an error back to the sender only.
        socket.emit("chatError", { message: "Message contains profanity and was not sent." });
        console.log("Profanity detected, message rejected:", messageData.content);
        return;
      }

      // Otherwise, save the clean message to the database
      const newMessage = await CommunityChat.create(messageData);
      // Broadcast the message to all clients in the same community room
      io.to(messageData.communityId).emit("chatMessage", newMessage);
    } catch (error) {
      console.error("Error saving chat message:", error);
      // Optionally, you can emit an error back if something goes wrong
      socket.emit("chatError", { message: "Error sending message." });
    }
  });
});



// Make io accessible to your controllers if needed
app.set("io", io);
app.set("userSockets", userSockets);

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
app.use("/api", bookmarkRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api", quizRoutes);
app.use("/api/notifications", notificationRouter);
app.use("/api/chat", communityChatRouter);
app.use("/api", ragRouter);
app.use("/api/report", reportRorter);

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
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
