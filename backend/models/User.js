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
      sparse: true, // Allows null values
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
      default: "", // URL or path to profile picture
    },
    communities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
