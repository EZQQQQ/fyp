// /backend/middlewares/upload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Creates a Multer upload middleware with a specified subdirectory.
 * @param {string} subDir - Subdirectory within the uploads folder (e.g., 'communityPosts').
 * @returns {multer.Multer} - Configured Multer instance.
 */
const createUploadMiddleware = (subDir = "") => {
  // Define the upload path
  const uploadPath = path.join(__dirname, `../uploads/${subDir}/`);

  // Ensure the upload directory exists
  fs.mkdirSync(uploadPath, { recursive: true });

  // Define storage for uploaded files
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // Generate a unique filename using timestamp and original name
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  // File filter to accept only images and videos
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images, videos and PDFs are allowed!"));
    }
  };

  // Initialize multer
  return multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: fileFilter,
  });
};

module.exports = createUploadMiddleware;
