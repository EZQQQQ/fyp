// backend/controllers/bookmarkController.js

const User = require("../models/User");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Comment = require("../models/Comment");
const Community = require("../models/Community");

/**
 * Toggle bookmark on a question
 */
const toggleBookmarkQuestion = async (req, res) => {
  const { questionId } = req.params;
  const userId = req.user._id;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the question is already bookmarked
    const isAlreadyBookmarked = user.bookmarkedQuestions.includes(questionId);

    let updatedUser;
    if (isAlreadyBookmarked) {
      // If already bookmarked, remove it
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { bookmarkedQuestions: questionId } },
        { new: true }
      );
    } else {
      // Otherwise, add it
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { bookmarkedQuestions: questionId } },
        { new: true }
      );
    }

    return res.json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all bookmarked questions for the logged-in user
 */
const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({
        path: "bookmarkedQuestions",
        populate: [
          {
            path: "user",
            select: "username profilePicture",
          },
          {
            path: "community",
            select: "name avatar",
          },
        ],
        select: "title content files user voteCount createdAt upvoters downvoters community",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const bookmarkedQuestions = user.bookmarkedQuestions || [];
    console.log("Bookmarked Questions:", bookmarkedQuestions);

    const questionsWithExtras = await Promise.all(
      bookmarkedQuestions.map(async (question) => {
        try {
          const userHasUpvoted = question.upvoters
            ? question.upvoters.some(
              (voterId) => voterId.toString() === userId.toString()
            )
            : false;
          const userHasDownvoted = question.downvoters
            ? question.downvoters.some(
              (voterId) => voterId.toString() === userId.toString()
            )
            : false;

          const answersCount = await Answer.countDocuments({
            question_id: question._id,
          });
          const commentsCount = await Comment.countDocuments({
            question_id: question._id,
          });

          const _id = question._id ? question._id.toString() : question.id;

          return {
            ...question,
            _id,
            userHasUpvoted,
            userHasDownvoted,
            answersCount,
            commentsCount,
            isBookmarked: true,
          };
        } catch (questionError) {
          console.error(
            `Error processing question ID ${question._id || question.id}:`,
            questionError
          );
          return null;
        }
      })
    );

    const validQuestions = questionsWithExtras.filter((q) => q !== null);

    res.status(200).json({
      status: true,
      data: validQuestions,
    });
  } catch (err) {
    console.error("Error fetching user bookmarks:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  toggleBookmarkQuestion,
  getUserBookmarks,
};