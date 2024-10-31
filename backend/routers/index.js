// backend/routers/index.js

const express = require("express");
const router = express.Router();

const UserRouter = require("./User");
const CommentRouter = require("./Comment");
const AnswerRouter = require("./Answer");
const VoteRouter = require("./Vote");
const CommunityRouter = require("./Community");
const QuestionRouter = require("./Question");

// Mount sub-routers with distinct base paths
router.use("/user", UserRouter);
router.use("/comment", CommentRouter);
router.use("/answer", AnswerRouter);
router.use("/", VoteRouter);
router.use("/communities", CommunityRouter);
router.use("/question", QuestionRouter);

module.exports = router;
