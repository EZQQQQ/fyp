// /backend/routers/User.js

const express = require("express");
const router = express.Router();
const {
  validateRegisterUser,
  validateLoginUser,
} = require("../middlewares/validate");
const auth = require("../middlewares/auth");
const userController = require("../controllers/userController");

// POST /api/user/register - Register a new user
router.post("/register", validateRegisterUser, userController.registerUser);

// POST /api/user/login - Login a user
router.post("/login", validateLoginUser, userController.loginUser);

// GET /api/user/profile - Get authenticated user's profile
router.get("/profile", auth, userController.getUserProfile);

module.exports = router;
