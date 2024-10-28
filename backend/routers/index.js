// /backend/routers/index.js

const express = require("express");
const router = express.Router();

const userRouter = require("./User");
const questionRouter = require("./Question");
const answerRouter = require("./Answer");
const commentRouter = require("./Comment");

router.use("/user", userRouter);
router.use("/question", questionRouter);
router.use("/answer", answerRouter);
router.use("/comment", commentRouter);

module.exports = router;
