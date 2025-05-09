// /backend/server.js

require("dotenv").config();
const express = require("express");
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
const reportRouter = require("./routers/Report");
const errorHandler = require("./middlewares/errorHandler");
const { swaggerSpec, swaggerUi } = require("./utils/swaggerConfig");

const http = require("http");
const socketIo = require("socket.io");
const CommunityChat = require("./models/CommunityChat");
const {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} = require("obscenity");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

// Keep a map of connected users
const userSockets = new Map();

// Initialize profanity checker instances outside the connection handler
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});
const censor = new TextCensor();

// Socket.io events
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Register user socket
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

  // Chat events
  socket.on("joinRoom", ({ communityId, anonymousName }) => {
    socket.join(communityId);
    console.log(`User ${anonymousName} joined community ${communityId}`);
  });

  socket.on("leaveRoom", ({ communityId, anonymousName }) => {
    socket.leave(communityId);
    console.log(`User ${anonymousName} left community ${communityId}`);
  });

  socket.on("chatMessage", async (messageData) => {
    try {
      // Check for profanity using obscenity
      const matches = matcher.getAllMatches(messageData.content);
      if (matches && matches.length > 0) {
        socket.emit("chatError", { message: "Message contains profanity and was not sent." });
        console.log("Profanity detected, message rejected:", messageData.content);
        return;
      }
      // Save the clean message to the database
      const newMessage = await CommunityChat.create(messageData);
      // Broadcast the message to all clients in the same community room
      io.to(messageData.communityId).emit("chatMessage", newMessage);
    } catch (error) {
      console.error("Error saving chat message:", error);
      socket.emit("chatError", { message: "Error sending message." });
    }
  });
});

// Make io and userSockets accessible in controllers if needed
app.set("io", io);
app.set("userSockets", userSockets);

// Connect to the database
connectToDatabase();

// CORS configuration
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

// Logging middleware
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url} from Origin: ${req.headers.origin}`);
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
app.use("/api/report", reportRouter);

// Swagger Setup (documentation available at /api-docs)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


// Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
