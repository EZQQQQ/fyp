// /backend/controllers/questionController.js

const mongoose = require("mongoose");
const Question = require("../models/Question");
const Community = require("../models/Community");
const Answer = require("../models/Answer");
const Comment = require("../models/Comment");
const User = require("../models/User");

/**
 * Helper function to escape special regex characters in user input
 * to prevent regex injection attacks.
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/**
 * Create a new question.
 */
const createQuestion = async (req, res) => {
  try {
    const { community, title, contentType, content, pollOptions, tags } = req.body;

    // Check for existing question with the same title
    const existingQuestion = await Question.findOne({ title });
    if (existingQuestion) {
      return res.status(400).json({
        status: false,
        message: "A question with this title already exists.",
      });
    }

    // Validate required fields
    if (!community || !title || contentType === undefined) {
      console.error('Validation Error: Missing required fields.', { community, title, contentType });
      return res.status(400).json({
        status: false,
        message: 'Community, title, and contentType are required.',
      });
    }

    if (
      (parseInt(contentType) === 0 || parseInt(contentType) === 2) &&
      !content
    ) {
      console.error('Validation Error: Content is required for Text and Poll questions.', { contentType });
      return res.status(400).json({
        status: false,
        message: 'Content is required for Text and Poll questions.',
      });
    }

    // Validate if the user is a member of the specified community
    const isMember = await Community.exists({
      _id: community,
      members: req.user.id,
    });

    if (!isMember) {
      console.error('Authorization Error: User is not a member of the community.', { userId: req.user.id, community });
      return res.status(403).json({
        status: false,
        message: 'You are not a member of the specified community.',
      });
    }

    // Map the uploaded files to get their S3 URLs
    const files = req.files ? req.files.map((file) => file.location) : [];

    // Transform pollOptions if present
    let formattedPollOptions = [];
    if (pollOptions) {
      try {
        const parsedOptions = JSON.parse(pollOptions);
        if (Array.isArray(parsedOptions)) {
          formattedPollOptions = parsedOptions.map((option) => ({
            option: option.option,
            votes: 0, // Initialize votes
          }));
        }
      } catch (parseError) {
        console.error('Parsing Error: Invalid format for pollOptions.', { pollOptions });
        return res.status(400).json({
          status: false,
          message: 'Invalid format for pollOptions.',
        });
      }
    }

    const question = new Question({
      community,
      title,
      contentType,
      content,
      pollOptions: formattedPollOptions,
      files,
      tags: tags ? JSON.parse(tags) : [],
      user: req.user.id,
      upvoters: [],
      downvoters: [],
      isClosed: false,
      voteCount: 0,
    });

    await question.save();

    // Increment the user's questionsCount
    await User.findByIdAndUpdate(req.user._id, { $inc: { questionsCount: 1 } });

    res.status(201).json({
      status: true,
      message: 'Question created successfully',
      data: question,
    });
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({
      status: false,
      message: 'Error creating question',
      error: err.message,
    });
  }
};

/**
 * Get all questions.
 * Note: Depending on your application's requirements, you might want to restrict this
 * to only the communities the user is a member of or implement pagination.
 */
const getAllQuestions = async (req, res) => {
  try {
    const userId = req.user._id; // Extract userId from authenticated user

    // Fetch questions from communities the user is a member of
    const userCommunities = await Community.find({ members: userId }).select(
      "_id"
    );

    if (!userCommunities || userCommunities.length === 0) {
      return res.status(200).json({
        status: true,
        data: [],
        message: "You are not a member of any communities.",
      });
    }

    const communityIds = userCommunities.map((c) => c._id);

    const questions = await Question.find({ community: { $in: communityIds } })
      .populate("user", "name profilePicture")
      .populate("community", "name avatar")
      .sort({ createdAt: -1 });

    // Add vote status and counts to each question
    const questionsWithExtras = await Promise.all(
      questions.map(async (question) => {
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

        // Convert Mongoose document to plain object
        const questionObj = question.toObject();

        return {
          ...questionObj,
          userHasUpvoted,
          userHasDownvoted,
          answersCount,
          commentsCount,
        };
      })
    );

    res.status(200).json({
      status: true,
      data: questionsWithExtras,
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching questions",
      error: err.message,
    });
  }
};

/**
 * Get questions from user's communities.
 */
const getUserQuestions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's communities
    const userCommunities = await Community.find({ members: userId }).select(
      "_id"
    );

    if (!userCommunities || userCommunities.length === 0) {
      return res.status(200).json({
        status: true,
        data: [],
        message: "You are not a member of any communities.",
      });
    }

    const communityIds = userCommunities.map((community) => community._id);

    // Fetch questions from user's communities
    const questions = await Question.find({ community: { $in: communityIds } })
      .populate("user", "name username profilePicture")
      .populate("community", "name avatar")
      .sort({ createdAt: -1 });

    // Enrich questions with additional data
    const questionsWithExtras = await Promise.all(
      questions.map(async (question) => {
        const userHasUpvoted = question.upvoters.includes(userId);
        const userHasDownvoted = question.downvoters.includes(userId);

        const answersCount = await Answer.countDocuments({
          question_id: question._id,
        });
        const commentsCount = await Comment.countDocuments({
          question_id: question._id,
        });

        const questionObj = question.toObject();

        return {
          ...questionObj,
          userHasUpvoted,
          userHasDownvoted,
          answersCount,
          commentsCount,
        };
      })
    );

    res.status(200).json({
      status: true,
      data: questionsWithExtras,
    });
  } catch (err) {
    console.error("Error fetching user's questions:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching questions from your communities.",
      error: err.message,
    });
  }
};

/**
 * Get a question by its ID.
 */
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Extracting userId from authenticated user

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid question ID format.",
      });
    }

    const question = await Question.findById(id)
      .populate("user", "name username profilePicture")
      .populate("community", "name avatar")
      .populate({
        path: "answers",
        populate: { path: "user", select: "name username profilePicture" },
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "name username profilePicture" },
      })
      .lean(); // Convert to plain JavaScript object

    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    // Check if the user is a member of the community containing the question
    const isMember = await Community.exists({
      _id: question.community._id,
      members: userId,
    });

    if (!isMember) {
      return res.status(403).json({
        status: false,
        message:
          "You are not a member of the community containing this question.",
      });
    }

    // Add vote status
    question.userHasUpvoted = question.upvoters
      ? question.upvoters.some(
        (voterId) => voterId.toString() === userId.toString()
      )
      : false;
    question.userHasDownvoted = question.downvoters
      ? question.downvoters.some(
        (voterId) => voterId.toString() === userId.toString()
      )
      : false;

    // For each answer, add vote status
    question.answers = question.answers.map((ans) => ({
      ...ans,
      userHasUpvoted: ans.upvoters
        ? ans.upvoters.some(
          (voterId) => voterId.toString() === userId.toString()
        )
        : false,
      userHasDownvoted: ans.downvoters
        ? ans.downvoters.some(
          (voterId) => voterId.toString() === userId.toString()
        )
        : false,
    }));

    // Remove upvoters and downvoters arrays from the response if not needed
    delete question.upvoters;
    delete question.downvoters;
    question.answers = question.answers.map((ans) => {
      delete ans.upvoters;
      delete ans.downvoters;
      return ans;
    });

    res.status(200).json({
      status: true,
      data: question,
    });
  } catch (err) {
    console.error("Error fetching question:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching question",
      error: err.message,
    });
  }
};

/**
 * Get questions by community ID.
 */
const getQuestionsByCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user._id; // Assuming you have user authentication

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Community ID format" });
    }

    // Check if the user is a member of the specified community
    const isMember = await Community.exists({
      _id: communityId,
      members: userId,
    });

    if (!isMember) {
      return res.status(403).json({
        status: false,
        message: "You are not a member of this community.",
      });
    }

    const questions = await Question.find({ community: communityId })
      .populate("user", "name username profilePicture")
      .populate("community", "name avatar")
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects

    // Enrich questions with vote data and counts
    const questionsWithExtras = await Promise.all(
      questions.map(async (question) => {
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

        return {
          ...question,
          voteCount: question.upvoters.length - question.downvoters.length,
          userHasUpvoted,
          userHasDownvoted,
          answersCount,
          commentsCount,
        };
      })
    );

    res.status(200).json({ status: true, data: questionsWithExtras });
  } catch (error) {
    console.error("Error fetching questions by community:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};

/**
 * Search Questions Controller
 * Implements search within communities the user is a member of.
 */
const searchQuestions = async (req, res) => {
  try {
    const { query, community } = req.query;
    const userId = req.user.id;

    // Validate 'query' parameter
    if (!query || query.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Query parameter is required.",
      });
    }

    // Initialize aggregation pipeline
    const pipeline = [];

    // Handle 'community' parameter
    if (community && community.toLowerCase() !== "all") {
      // User specified a specific community
      if (!mongoose.Types.ObjectId.isValid(community)) {
        return res.status(400).json({
          status: false,
          message: "Invalid community ID.",
        });
      }

      // Add match stage for the specified community
      pipeline.push({
        $match: { community: new mongoose.Types.ObjectId(community) },
      });
    } else {
      // Fetch user's communities
      const userCommunities = await Community.find({ members: userId }).select(
        "_id"
      );

      if (!userCommunities || userCommunities.length === 0) {
        return res.status(200).json({
          status: true,
          data: [],
          message: "You are not a member of any communities.",
        });
      }

      const communityIds = userCommunities.map(
        (c) => new mongoose.Types.ObjectId(c._id)
      );

      // Add match stage for user's communities
      pipeline.push({
        $match: { community: { $in: communityIds } },
      });
    }

    // Escape user input to prevent regex injection
    const escapedQuery = escapeRegex(query);

    // Create regex patterns for case-insensitive partial matching
    const titleRegex = new RegExp(escapedQuery, "i");
    const contentRegex = new RegExp(escapedQuery, "i");

    // Add match stage for title, content, and exact tag matches
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: titleRegex } },
          { content: { $regex: contentRegex } },
          { tags: query },
        ],
      },
    });

    // Add fields for relevance scoring and vote count
    pipeline.push({
      $addFields: {
        score: {
          $add: [
            {
              $cond: [{ $in: [query, "$tags"] }, 3, 0],
            },
            {
              $cond: [
                { $regexMatch: { input: "$title", regex: titleRegex } },
                2,
                0,
              ],
            },
            {
              $cond: [
                { $regexMatch: { input: "$content", regex: contentRegex } },
                1,
                0,
              ],
            },
          ],
        },
        voteCount: {
          $subtract: [{ $size: "$upvoters" }, { $size: "$downvoters" }],
        },
      },
    });

    // Sort results by 'score' in descending order
    pipeline.push({ $sort: { score: -1 } });

    // Populate the 'user' field
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    });
    pipeline.push({ $unwind: "$user" });

    // Populate the 'community' field
    pipeline.push({
      $lookup: {
        from: "communities",
        localField: "community",
        foreignField: "_id",
        as: "community",
      },
    });
    pipeline.push({ $unwind: "$community" });

    // Populate answers to get answersCount
    pipeline.push({
      $lookup: {
        from: "answers",
        localField: "_id",
        foreignField: "question_id",
        as: "answers",
      },
    });

    // Populate comments to get commentsCount
    pipeline.push({
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "question_id",
        as: "comments",
      },
    });

    // Add counts for answers and comments
    pipeline.push({
      $addFields: {
        answersCount: { $size: "$answers" },
        commentsCount: { $size: "$comments" },
      },
    });

    // Project necessary fields
    pipeline.push({
      $project: {
        title: 1,
        content: 1,
        tags: 1,
        files: 1, // Ensure 'files' field is included as is
        contentType: 1,
        user: { username: 1, profilePicture: 1 },
        community: { name: 1, avatar: 1 },
        upvoters: 1,
        downvoters: 1,
        createdAt: 1,
        updatedAt: 1,
        voteCount: 1,
        answersCount: 1,
        commentsCount: 1,
      },
    });

    // Execute aggregation pipeline
    const questions = await Question.aggregate(pipeline).exec();

    // Map questions to include userHasUpvoted and userHasDownvoted
    const results = questions.map((question) => ({
      ...question,
      userHasUpvoted: question.upvoters
        .map((id) => id.toString())
        .includes(userId),
      userHasDownvoted: question.downvoters
        .map((id) => id.toString())
        .includes(userId),
    }));

    res.status(200).json({
      status: true,
      data: results,
    });
  } catch (error) {
    console.error("Error searching questions:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

/**
 * Delete a question by ID.
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid question ID format.",
      });
    }

    // Find the question
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    // Only allow professors, admins, or the question owner to delete
    if (
      req.user.role !== 'professor' &&
      req.user.role !== 'admin' &&
      question.user.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to delete this question",
      });
    }

    // Delete all comments related to this question
    await Comment.deleteMany({ question_id: id });

    // Find and delete all answers and their comments
    const answers = await Answer.find({ question_id: id });
    for (const answer of answers) {
      await Comment.deleteMany({ answer_id: answer._id });
    }
    await Answer.deleteMany({ question_id: id });

    // Delete the question itself
    await Question.findByIdAndDelete(id);

    // Decrement the user's questionsCount if it was the owner
    if (question.user.toString() === userId.toString()) {
      await User.findByIdAndUpdate(userId, { $inc: { questionsCount: -1 } });
    }

    res.status(200).json({
      status: true,
      message: "Question and all related content deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting question:", err);
    res.status(500).json({
      status: false,
      message: "Error deleting question",
      error: err.message,
    });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getUserQuestions,
  getQuestionById,
  getQuestionsByCommunity,
  searchQuestions,
  deleteQuestion,
};
