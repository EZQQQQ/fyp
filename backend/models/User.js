// backend/models/User.js

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // Password is optional for SSO users
    },
    role: {
      type: String,
      enum: ["student", "professor", "admin"],
      default: "student",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profileBanner: {
      type: String,
      default: "",
    },
    profileBio: {
      type: String,
      default: "",
    },
    communities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
      },
    ],
    // Number of communities user belongs to
    communitiesCount: {
      type: Number,
      default: 0,
    },
    // Number of questions user posts
    questionsCount: {
      type: Number,
      default: 0,
    },
    // Number of answers user gives
    answersCount: {
      type: Number,
      default: 0,
    },
    // Number of comments user gives
    commentsCount: {
      type: Number,
      default: 0,
    },
    // field track dashboard popup preference
    hideDashboard: {
      type: Boolean,
      default: false,
    },
    // field track to gate navigation
    profileComplete: {
      type: Boolean,
      default: false,
    },
    // field for storing bookmarked questions
    bookmarkedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
