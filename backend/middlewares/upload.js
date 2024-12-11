// /backend/middlewares/upload.js

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

// Allowed file types (images, videos, PDFs)
const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf/;

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos, and PDFs are allowed!'));
  }
};

// Multer-S3 storage configuration
const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  key: function (req, file, cb) {
    const communityId = req.body.community;
    if (!communityId) {
      return cb(new Error('Community ID is required to upload files'), null);
    }

    // Ensure communityId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return cb(new Error('Invalid Community ID'), null);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`;

    // Determine the upload path based on field name
    let uploadPath;
    if (file.fieldname === 'files') { // For question creation
      uploadPath = `uploads/communityPosts/${communityId}/${uniqueFilename}`;
    } else if (file.fieldname === 'avatar') { // For community avatar uploads
      uploadPath = `uploads/communityAvatars/${communityId}/${uniqueFilename}`;
    } else {
      return cb(new Error('Unknown field'), null);
    }

    cb(null, uploadPath);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
