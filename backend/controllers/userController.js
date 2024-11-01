// /backend/controllers/userController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
const registerUser = async (req, res) => {
  try {
    console.log("Incoming Registration Data:", req.body); // Log incoming data
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email already in use",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      // Add other fields as needed
    });

    const savedUser = await newUser.save();
    console.log("User Registered:", savedUser); // Log saved user

    // Generate JWT Token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: {
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          profilePicture: savedUser.profilePicture,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({
      status: false,
      message: "Error registering user",
      error: err.message,
    });
  }
};

// Login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Please provide email and password.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      status: true,
      message: "User logged in successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({
      status: false,
      message: "Error logging in user",
      error: err.message,
    });
  }
};

// Get authenticated user's profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      data: user,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching user profile",
      error: err.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
