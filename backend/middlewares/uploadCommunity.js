// /backend/middlewares/uploadCommunity.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define storage for community uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "avatar") {
      const uploadPath = path.join(__dirname, "../uploads/communityAvatars/");
      fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
      cb(null, uploadPath);
    } else if (file.fieldname === "files") {
      const uploadPath = path.join(__dirname, "../uploads/communityPosts/");
      fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
      cb(null, uploadPath);
    } else {
      cb(new Error("Unknown field"), false);
    }
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using timestamp and original name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// File filter to accept images, videos, and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Only images, videos, and PDFs are allowed for community uploads!"
      )
    );
  }
};

// Initialize multer with the defined storage and file filter
const uploadCommunity = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: fileFilter,
});

// Export the middleware to handle 'avatar' and 'files' fields
module.exports = uploadCommunity.fields([
  { name: "avatar", maxCount: 1 },
  { name: "files", maxCount: 10 }, // Adjust maxCount as needed
]);
