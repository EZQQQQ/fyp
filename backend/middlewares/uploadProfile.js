// /backend/middlewares/uploadProfile.js
require('dotenv').config();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const allowedTypes = /jpeg|jpg|png|heic|heif/;

const fileFilter = (req, file, cb) => {
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, PNG, HEIC, and HEIF images are allowed for profile photos!"));
  }
};

// Multer S3 storage configuration
const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  acl: undefined, // **Remove ACL to comply with bucket settings**
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let folder = '';

    // Determine folder based on field name
    if (file.fieldname === 'profilePicture') {
      folder = 'uploads/profilePhotos/';
    } else if (file.fieldname === 'profileBanner') {
      folder = 'uploads/profileBanner/';
    }

    cb(null, `${folder}${uniqueSuffix}-${file.originalname}`);
  }
});

// Multer upload configuration
const uploadProfile = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = uploadProfile;
