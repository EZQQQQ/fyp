// /backend/middlewares/uploadCommunity.js
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

const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf/;

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

const uploadCommunity = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      const communityId = req.body.community || req.body.communityId;
      if (!communityId) {
        return cb(new Error('Community ID is required'), null);
      }
      // Decide prefix based on fieldname
      if (file.fieldname === 'avatar') {
        cb(
          null,
          `uploads/communityAvatars/${communityId}/${file.originalname}`
        );
      } else if (file.fieldname === 'files') {
        cb(
          null,
          `uploads/communityPosts/${communityId}/${file.originalname}`
        );
      } else {
        cb(new Error('Unknown field'), null);
      }
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter,
});

module.exports = uploadCommunity.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'files', maxCount: 10 },
]);