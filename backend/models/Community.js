// /backend/models/Community.js

const mongoose = require("mongoose");

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Community name is required."],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rules: [
    {
      type: String,
      required: false,
    },
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Community", CommunitySchema);
