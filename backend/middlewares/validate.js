// /backend/middlewares/validate.js

const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Middleware to handle validation results
const handleValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return all error messages for better debugging
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// **Validation for Questions**
const validateQuestionFields = [
  body("community")
    .notEmpty()
    .withMessage("Community is required")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid community ID"),
  body("title").notEmpty().withMessage("Title is required"),
  body("contentType")
    .isInt({ min: 0, max: 2 })
    .withMessage("Invalid content type"),
  // Conditionally validate 'content' based on 'contentType'
  body("content").custom((value, { req }) => {
    const contentType = parseInt(req.body.contentType);
    if (
      (contentType === 0 || contentType === 2) &&
      (!value || value.trim() === "")
    ) {
      throw new Error("Content is required for Text and Poll questions");
    }
    return true;
  }),
  body("pollOptions").custom((value, { req }) => {
    if (parseInt(req.body.contentType) === 2) {
      if (!value) {
        throw new Error("Poll options are required for poll questions");
      }
      let options = value;
      if (typeof options === "string") {
        try {
          options = JSON.parse(options);
        } catch (err) {
          throw new Error("Poll options must be a valid JSON array");
        }
      }
      if (!Array.isArray(options) || options.length < 2) {
        throw new Error("At least two poll options are required");
      }
    }
    return true;
  }),
  handleValidationResults,
];

// **Separate File Validation Middleware**
const validateQuestionFiles = (req, res, next) => {
  if (parseInt(req.body.contentType) === 1) {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: "At least one file is required for image/video questions",
      });
    }
    // Optionally, validate file types here
    const allowedMimeTypes = ["image/jpeg", "image/png", "video/mp4"];
    for (let file of req.files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          status: false,
          message: `Invalid file type: ${file.originalname}`,
        });
      }
    }
  }
  next();
};

// **Validation for Answers**
// Validation for adding an answer (POST)
const validateAddAnswer = [
  param("questionId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid question ID"),
  body("answer")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Answer is required."),
  handleValidationResults,
];

// Validation for getting answers (GET)
const validateGetAnswers = [
  param("questionId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid question ID"),
  handleValidationResults,
];

// **Validation for Comments**
// Validation for adding a comment (POST)
const validateAddComment = [
  param("questionId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid question ID"),
  body("comment")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Comment is required."),
  handleValidationResults,
];

// Validation for getting comments (GET)
const validateGetComments = [
  param("questionId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid question ID"),
  handleValidationResults,
];

// Export all validation functions
module.exports = {
  validateQuestionFields,
  validateQuestionFiles,
  validateAddAnswer,
  validateGetAnswers,
  validateAddComment,
  validateGetComments,
  handleValidationResults,
};
