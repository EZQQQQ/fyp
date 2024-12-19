// /backend/middlewares/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: false, message: "Authentication required" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).json({ status: false, message: "Please authenticate" });
  }
};

module.exports = auth;
