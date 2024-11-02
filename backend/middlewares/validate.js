// /backend/middlewares/validate.js

const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Middleware to handle validation results
const handleValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return the first error message for consistency
    return res.status(400).json({
      status: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

// **Validation for Questions**
const validateQuestion = [
  body("community").notEmpty().withMessage("Community is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("contentType").isIn([0, 1, 2]).withMessage("Invalid content type"),
  // Additional validations based on contentType
  body("content").custom((value, { req }) => {
    if (parseInt(req.body.contentType) === 0 && !value) {
      throw new Error("Content is required for text questions");
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
        options = JSON.parse(options);
      }
      if (!Array.isArray(options) || options.length < 2) {
        throw new Error("At least two poll options are required");
      }
    }
    return true;
  }),
  body("files").custom((value, { req }) => {
    if (parseInt(req.body.contentType) === 1) {
      if (!req.files || req.files.length === 0) {
        throw new Error(
          "At least one file is required for image/video questions"
        );
      }
    }
    return true;
  }),
  handleValidationResults,
];

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

// // **Validation for User Registration**
// const validateRegisterUser = [
//   body("name").isString().trim().notEmpty().withMessage("Name is required."),
//   body("email").isEmail().withMessage("Valid email is required."),
//   body("password")
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least 6 characters."),
//   handleValidationResults,
// ];

// // **Validation for User Login**
// const validateLoginUser = [
//   body("email").isEmail().withMessage("Valid email is required."),
//   body("password").isString().withMessage("Password is required."),
//   handleValidationResults,
// ];

// Export all validation functions, including handleValidationResults
module.exports = {
  validateQuestion,
  validateAddAnswer,
  validateGetAnswers,
  validateAddComment,
  validateGetComments,
  validateRegisterUser,
  validateLoginUser,
  handleValidationResults, // Export this function
};
