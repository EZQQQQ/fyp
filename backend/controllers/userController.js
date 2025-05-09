// backend/controllers/userController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../firebaseAdmin");

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

    // Compute default username for new SSO users
    const defaultUsername =
      (name && name.replace(/\s+/g, "").toLowerCase()) ||
      email.split("@")[0].toLowerCase();

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      // Create new user with default username
      user = new User({
        username: defaultUsername,
        name: name || defaultUsername,
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
      isNewUser,
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
    const { username, profileBio } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // 1) Validate username
    if (!username?.trim()) {
      return res.status(400).json({ status: false, message: "Username is required" });
    }
    const normalized = username.trim().toLowerCase();
    const conflict = await User.findOne({ username: new RegExp(`^${normalized}$`, "i") });
    if (conflict && conflict._id.toString() !== user._id.toString()) {
      return res.status(400).json({ status: false, message: "Username already taken" });
    }
    user.username = username.trim();

    // 2) Update optional text fields
    if (typeof profileBio === "string") {
      user.profileBio = profileBio.trim();
    }

    // 3) Update uploaded images (handled by multer-s3 or similar)
    if (req.file && req.file.fieldname === "profilePicture") {
      user.profilePicture = req.file.location;
    }
    if (req.files?.profileBanner?.length) {
      user.profileBanner = req.files.profileBanner[0].location;
    }

    // 4) Mark complete only once all minimum requirements are met
    //    (e.g. username + bio, or adjust as you see fit)
    user.profileComplete = true;

    await user.save();

    // 5) Issue fresh JWT in case you care about any new claims
    const token = generateToken(user._id);

    return res.status(200).json({
      status: true,
      message: "Profile created successfully",
      data: { user, token },
    });
  } catch (err) {
    console.error("Profile Creation Error:", err);
    return res.status(500).json({
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

    // Generate a default username suggestion if user hasn't completed profile setup
    // Similar to the approach in ssoLoginUser
    const defaultUsername = user.username ||
      (user.name && user.name.replace(/\s+/g, "").toLowerCase()) ||
      (user.email && user.email.split("@")[0].toLowerCase());

    res.status(200).json({
      status: true,
      data: {
        ...user.toObject(),
        defaultUsername: defaultUsername
      }
    });
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
