// /backend/middlewares/errorHandler.js

const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  } else if (err.name === "FirebaseAuthError") {
    // Firebase-specific errors
    return res.status(401).json({
      status: false,
      message: "Firebase authentication failed.",
    });
  } else if (err) {
    // General errors
    return res.status(500).json({
      status: false,
      message: err.message || "An unexpected error occurred.",
    });
  }

  next();
};

module.exports = errorHandler;
