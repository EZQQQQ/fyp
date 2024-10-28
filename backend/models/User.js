// /backend/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["admin", "professor", "student"],
      default: "student",
    },
    // Add other user fields as needed (e.g., password, profilePicture, etc.)
    password: {
      type: String,
      required: true,
    },
    // Example profile picture URL
    profilePicture: {
      type: String,
      default: "", // Default to empty string or a placeholder image URL
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
