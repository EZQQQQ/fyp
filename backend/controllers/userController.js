// backend/controllers/userController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../firebaseAdmin"); // Import Firebase Admin

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// SSO Login Controller
const ssoLoginUser = async (req, res) => {
  try {
    const { token, isAdmin } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ status: false, message: "Token is required" });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name } = decodedToken;

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid token: Email not found" });
    }

    // Determine user role based on email domain or isAdmin flag
    let role = "student"; // Default role
    const emailDomain = email.split("@")[1].toLowerCase();
    if (emailDomain === "ntu.edu.sg") {
      role = "professor";
    }
    if (isAdmin) {
      role = "admin";
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Create new user
      user = new User({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        role,
        // No password for SSO users
      });
      await user.save();
    } else {
      // Update role if necessary
      if (isAdmin && user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }
    }

    // Generate JWT
    const appToken = generateToken(user._id);

    res.status(200).json({
      status: true,
      message: "SSO Login successful",
      data: { user, token: appToken },
    });
  } catch (err) {
    console.error("SSO Login Error:", err);
    res
      .status(500)
      .json({ status: false, message: "SSO Login failed", error: err.message });
  }
};

// Admin Login Controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ status: false, message: "Access denied" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      status: true,
      message: "Admin login successful",
      data: { user, token },
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res
      .status(500)
      .json({ status: false, message: "Server error", error: err.message });
  }
};

// Create User Profile Controller
const createUserProfile = async (req, res) => {
  try {
    const { username } = req.body;
    let profilePicture = "";

    if (req.file && req.file.location) {
      // Using the S3 URL provided by multer-s3
      profilePicture = req.file.location;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if username is unique
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Username already taken" });
    }

    // Update user profile
    user.username = username.trim();
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();

    // Generate new JWT if needed
    const token = generateToken(user._id);

    res.status(200).json({
      status: true,
      message: "Profile created successfully",
      data: { user, token },
    });
  } catch (err) {
    console.error("Profile Creation Error:", err);
    res.status(500).json({
      status: false,
      message: "Profile creation failed",
      error: err.message,
    });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -communities"
    );
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.status(200).json({ status: true, data: user });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching profile",
      error: err.message,
    });
  }
};

// Controller to Update hideDashboard Preference
const updateHideDashboardPreference = async (req, res) => {
  try {
    const { hideDashboard } = req.body;

    // Validate the incoming data
    if (typeof hideDashboard !== "boolean") {
      return res.status(400).json({
        status: false,
        message: "Invalid data: hideDashboard must be a boolean",
      });
    }

    // Find the user by ID and update the hideDashboard field
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found" });
    }

    user.hideDashboard = hideDashboard;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Dashboard preference updated successfully",
      data: { hideDashboard: user.hideDashboard },
    });
  } catch (err) {
    console.error("Update hideDashboard Preference Error:", err);
    res.status(500).json({
      status: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Update Settings - username, profileBio, profilePicture
const updateSettings = async (req, res) => {
  try {
    const { username, profileBio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // If username is provided and changed, check uniqueness
    if (username && username.trim() !== user.username) {
      const existingUser = await User.findOne({ username: username.trim() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res
          .status(400)
          .json({ status: false, message: "Username already taken" });
      }
      user.username = username.trim();
    }

    // Update profileBio if provided
    if (typeof profileBio === "string") {
      user.profileBio = profileBio.trim();
    }

    // If a new profile photo is uploaded
    if (req.files && req.files.profilePicture && req.files.profilePicture.length > 0) {
      const newProfilePhoto = req.files.profilePicture[0].location;
      user.profilePicture = newProfilePhoto;
    }

    await user.save();
    res.status(200).json({
      status: true,
      message: "Settings updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("Update Settings Error:", err);
    res.status(500).json({
      status: false,
      message: "Failed to update settings",
      error: err.message,
    });
  }
};

// Update Profile - profilePicture and profileBanner
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // If a new profile photo is uploaded
    if (req.files && req.files.profilePicture && req.files.profilePicture.length > 0) {
      const newProfilePhoto = req.files.profilePicture[0].location;
      user.profilePicture = newProfilePhoto;
    }

    // If a new profile banner is uploaded
    if (req.files && req.files.profileBanner && req.files.profileBanner.length > 0) {
      const newProfileBanner = req.files.profileBanner[0].location;
      user.profileBanner = newProfileBanner;
    }

    await user.save();
    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({
      status: false,
      message: "Failed to update profile",
      error: err.message,
    });
  }
};

module.exports = {
  ssoLoginUser,
  loginUser,
  createUserProfile,
  getUserProfile,
  updateHideDashboardPreference,
  updateSettings,
  updateProfile,
};
