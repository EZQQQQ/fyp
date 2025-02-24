// backend/middlewares/uploadMemory.js
// in-memory upload storage for multer
require('dotenv').config();
const multer = require('multer');
const path = require('path');

// Allowed file types: PDF, DOCX, and TXT (case insensitive)
const allowedTypes = /pdf|docx|txt/i;

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and TXT files are allowed!'), false);
  }
};

// Use memory storage so files are kept in RAM and not persisted
const storage = multer.memoryStorage();

const uploadMemory = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = uploadMemory;
