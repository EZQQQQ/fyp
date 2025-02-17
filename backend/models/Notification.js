// backend/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    type: { type: String, enum: ["questionAnswer", "questionComment", "answerComment"], required: true },
    content: { type: String, required: true }, // excerpt of answer/comment
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
