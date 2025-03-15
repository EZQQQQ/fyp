// /backend/middlewares/uploadCommunity.js

require('dotenv').config();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const mongoose = require('mongoose'); // Import mongoose

// Configure AWS
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|heic|heif|hevc/;

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only images, videos, and PDFs are allowed for community uploads!'
      )
    );
  }
};

// Multer-S3 storage configuration
const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  key: function (req, file, cb) {
    // Try to get the community ID from either the form fields or from the custom property
    const communityId = req.body.community || req.body.communityId || req.communityId;

    if (!communityId) {
      return cb(new Error('Community ID is required'), null);
    }

    // Validate communityId format
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return cb(new Error('Invalid Community ID'), null);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`;

    // Determine the upload path based on field name
    let uploadPath;
    if (file.fieldname === 'avatar') {
      uploadPath = `uploads/communityAvatars/${communityId}/${uniqueFilename}`;
    } else if (file.fieldname === 'files') {
      uploadPath = `uploads/communityPosts/${communityId}/${uniqueFilename}`;
    } else {
      return cb(new Error('Unknown field'), null);
    }

    // Optional: Log the upload path for debugging
    console.log(`Uploading file to: ${uploadPath}`);

    cb(null, uploadPath);
  },
});

// Initialize multer with the defined storage and file filters
const uploadCommunity = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Export the middleware to handle specific fields
module.exports = uploadCommunity.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'files', maxCount: 10 },
]);
