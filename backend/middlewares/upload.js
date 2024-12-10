// /backend/middlewares/upload.js

require('dotenv').config();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

// Allowed file types (images, videos, PDFs)
const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf/;

const fileFilter = (req, file, cb) => {
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos, and PDFs are allowed!'));
  }
};

const createUploadMiddleware = () => {
  return multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET_NAME,
      acl: 'public-read',
      key: function (req, file, cb) {
        const communityId = req.body.community;
        const filePath = `uploads/communityPosts/${communityId}/${file.originalname}`;
        cb(null, filePath);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter,
  });
};

module.exports = createUploadMiddleware;