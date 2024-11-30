// /backend/controllers/communityController.js

const mongoose = require("mongoose");
const Community = require("../models/Community");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const path = require("path");

// Create a new community
const createCommunity = async (req, res) => {
  try {
    const { name, description, rules } = req.body;
    const createdBy = req.user._id;

    let avatar = "/uploads/defaults/default-avatar.jpeg"; // Default avatar path

    // Check if avatar was uploaded
    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
      // Assuming the server serves static files from '/uploads'
      avatar = `/uploads/communityAvatars/${req.files.avatar[0].filename}`;
      console.log("Avatar uploaded:", avatar); // Logging
    }

    // Ensure rules is an array
    const parsedRules = Array.isArray(rules) ? rules : [rules];

    const community = new Community({
      name,
      description,
      createdBy,
      members: [createdBy], // Initial member is the creator
      avatar,
      rules: parsedRules,
    });

    await community.save();

    // Update the user's communities array
    const updatedUser = await User.findByIdAndUpdate(
      createdBy,
      { $push: { communities: community._id } },
      { new: true } // Return the updated document
    );

    res.status(201).json({
      status: true,
      message: "Community created successfully.",
      data: community,
    });
  } catch (error) {
    console.error("Error creating community:", error);

    // Check if the error is a duplicate key error for the 'name' field
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(400).json({
        status: false,
        message: "Community name already exists.",
      });
    }

    res.status(500).json({
      status: false,
      message: "Error creating community.",
      error: error.message,
    });
  }
};

// Get all communities
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(200).json({
      status: true,
      data: communities,
    });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching communities.",
      error: error.message,
    });
  }
};

// Get User Communities Controller
const getUserCommunities = async (req, res) => {
  try {
    const userId = req.user.id; // Retrieved from authenticate middleware

    const communities = await Community.find({
      members: { $in: [userId] }, // Check if user is a member
    }).populate("createdBy", "name email");

    res.status(200).json({
      status: true,
      communities,
    });
  } catch (error) {
    console.error("Error fetching user communities:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error.",
    });
  }
};

// Join a community
const joinCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        status: false,
        message: "Community not found.",
      });
    }

    // Check if user is already a member
    if (community.members.includes(userId)) {
      return res.status(400).json({
        status: false,
        message: "You are already a member of this community.",
      });
    }

    // Add user to community's members
    community.members.push(userId);
    await community.save();

    // Add community to user's communities
    const user = await User.findById(userId);
    if (!user.communities.includes(communityId)) {
      user.communities.push(communityId);
      await user.save();
    }

    res.status(200).json({
      status: true,
      message: "Successfully joined the community.",
      data: community,
    });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({
      status: false,
      message: "Error joining community.",
      error: error.message,
    });
  }
};

// Leave a community
const leaveCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        status: false,
        message: "Community not found.",
      });
    }

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(400).json({
        status: false,
        message: "You are not a member of this community.",
      });
    }

    community.members = community.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );
    await community.save();

    res.status(200).json({
      status: true,
      message: "Successfully left the community.",
      data: community,
    });
  } catch (error) {
    console.error("Error leaving community:", error);
    res.status(500).json({
      status: false,
      message: "Error leaving community.",
      error: error.message,
    });
  }
};

// Get community by ID
const getCommunityById = async (req, res) => {
  try {
    const communityId = req.params.id;

    // Validate ObjectId format
    if (!communityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Community ID format" });
    }

    const community = await Community.findById(communityId)
      .populate("createdBy", "name email")
      .populate("members", "username email")
      .exec();

    if (!community) {
      return res
        .status(404)
        .json({ status: false, message: "Community not found" });
    }

    res.status(200).json({ status: true, data: community });
  } catch (error) {
    console.error("Error fetching community by ID:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};

// Get Assessment Tasks for a Community
const getAssessmentTasks = async (req, res) => {
  const { id } = req.params;

  try {
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    res.json({ tasks: community.assessmentTasks });
  } catch (error) {
    console.error("Error fetching assessment tasks:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get User Participation Metrics
const getUserParticipation = async (req, res) => {
  const { communityId } = req.params;
  const userId = req.user.id; // Assuming auth middleware sets req.user

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const participation = await Promise.all(
      community.assessmentTasks.map(async (task) => {
        const value = await calculateStudentProgress(userId, task, communityId);

        // console.log(
        //   `User ${userId} participation for task ${task._id}: ${value}`
        // );

        return {
          _id: task._id,
          label: task.label,
          total: task.total,
          studentProgress: value,
        };
      })
    );

    res.json({ participation });
  } catch (error) {
    console.error("Error fetching user participation:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Create a new assessment task
const createAssessmentTask = async (req, res) => {
  const { communityId } = req.params;
  const { label, adminLabel, type, contentType, total, weight } = req.body;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    // Create new assessment task
    const newTask = {
      label,
      adminLabel,
      type,
      contentType,
      total,
      weight,
    };

    // Add the new task to the community's assessmentTasks array
    community.assessmentTasks.push(newTask);

    // Save the community
    await community.save();

    // Get the newly added task (it's the last one in the array)
    const createdTask =
      community.assessmentTasks[community.assessmentTasks.length - 1];

    res.status(201).json({
      message: "Assessment task created successfully.",
      task: createdTask,
    });
  } catch (error) {
    console.error("Error creating assessment task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update an existing assessment task
const updateAssessmentTask = async (req, res) => {
  const { communityId, taskId } = req.params;
  const { label, adminLabel, type, contentType, total, weight } = req.body;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const task = community.assessmentTasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Assessment task not found." });
    }

    // Update task fields
    task.label = label !== undefined ? label : task.label;
    task.adminLabel = adminLabel !== undefined ? adminLabel : task.adminLabel;
    task.type = type !== undefined ? type : task.type;
    task.contentType =
      contentType !== undefined ? contentType : task.contentType;
    task.total = total !== undefined ? total : task.total;
    task.weight = weight !== undefined ? weight : task.weight;

    await community.save();

    res.json({ message: "Assessment task updated.", task });
  } catch (error) {
    console.error("Error updating assessment task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete an assessment task
const deleteAssessmentTask = async (req, res) => {
  console.log(`Received DELETE request for task ${req.params.taskId}`);
  const { communityId, taskId } = req.params;

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    return res.status(400).json({ message: "Invalid community ID." });
  }
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: "Invalid task ID." });
  }

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    // Check if the task exists within the assessmentTasks array
    const task = community.assessmentTasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Assessment task not found." });
    }

    // Remove the task using the pull method
    community.assessmentTasks.pull(taskId);

    // Save the updated community
    await community.save();

    res.json({ message: "Assessment task deleted successfully." });
  } catch (error) {
    console.error("Error deleting assessment task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get assessment tasks with student progress
const getAssessmentTasksWithProgress = async (req, res) => {
  const { communityId } = req.params;
  const userId = req.user.id;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const tasksWithProgress = await Promise.all(
      community.assessmentTasks.map(async (task) => {
        const studentProgress = await calculateStudentProgress(
          userId,
          task,
          communityId
        );
        return {
          _id: task._id,
          label: task.label,
          total: task.total,
          studentProgress,
        };
      })
    );

    res.json(tasksWithProgress);
  } catch (error) {
    console.error("Error fetching assessment tasks with progress:", error);
    res.status(500).json({ message: "Server error." });
  }
};

async function calculateStudentProgress(userId, task, communityId) {
  let progress = 0;

  switch (task.type) {
    case "votes":
      if (task.contentType === "questions") {
        // Get all questions authored by the user in the community
        const questions = await Question.find({
          community: communityId,
          user: userId,
        });

        progress = 0;

        for (const question of questions) {
          // Exclude votes from the author themselves
          const upvotes = question.upvoters.filter(
            (voterId) => voterId.toString() !== userId.toString()
          ).length;
          const downvotes = question.downvoters.filter(
            (voterId) => voterId.toString() !== userId.toString()
          ).length;
          const netVotes = upvotes - downvotes;
          progress += netVotes;
        }

        // console.log(
        //   `User ${userId} has a net vote total of ${progress} for their questions in community ${communityId}`
        // );
      } else if (task.contentType === "answers") {
        // Get all answers authored by the user
        const answers = await Answer.find({
          user: userId,
        }).populate({
          path: "question_id",
          match: { community: communityId },
          select: "_id",
        });

        // Only include answers where question_id is populated (i.e., the question is in the community)
        const filteredAnswers = answers.filter((answer) => answer.question_id);

        progress = 0;

        for (const answer of filteredAnswers) {
          // Exclude votes from the author themselves
          const upvotes = answer.upvoters.filter(
            (voterId) => voterId.toString() !== userId.toString()
          ).length;
          const downvotes = answer.downvoters.filter(
            (voterId) => voterId.toString() !== userId.toString()
          ).length;
          const netVotes = upvotes - downvotes;
          progress += netVotes;
        }

        // console.log(
        //   `User ${userId} has a net vote total of ${progress} for their answers in community ${communityId}`
        // );
      } else if (task.contentType === "questions & answers") {
        // Questions
        const questions = await Question.find({
          community: communityId,
          user: userId,
        });

        let questionProgress = 0;

        for (const question of questions) {
          const upvotes = question.upvoters.filter(
            (voterId) => voterId.toString() !== userId.toString()
          ).length;
          const downvotes = question.downvoters.filter(
            (voterId) => voterId.toString() !== userId.toString()
          ).length;
          const netVotes = upvotes - downvotes;
          questionProgress += netVotes;
        }

        // Answers
        const answers = await Answer.find({
          user: userId,
        }).populate({
          path: "question_id",
          match: { community: communityId },
          select: "_id",
        });

        const filteredAnswers = answers.filter((answer) => answer.question_id);

        let answerProgress = 0;

        for (const answer of filteredAnswers) {
          const upvotes = answer.upvoters.filter(
            (voterId) => voterId.toString() !== userId.toString()
          ).length;
          const downvotes = answer.downvoters.filter(
            (voterId) => voterId.toString() !== userId.toString()
          ).length;
          const netVotes = upvotes - downvotes;
          answerProgress += netVotes;
        }

        progress = questionProgress + answerProgress;

        // console.log(
        //   `User ${userId} has a net vote total of ${progress} for their questions and answers in community ${communityId}`
        // );
      }
      break;

    case "postings":
      if (task.contentType === "questions") {
        progress = await Question.countDocuments({
          user: userId,
          community: communityId,
        });
      } else if (task.contentType === "answers") {
        const answers = await Answer.find({
          user: userId,
        }).populate({
          path: "question_id",
          match: { community: communityId },
          select: "_id",
        });

        const filteredAnswers = answers.filter((answer) => answer.question_id);

        progress = filteredAnswers.length;
      } else if (task.contentType === "both") {
        const questionCount = await Question.countDocuments({
          user: userId,
          community: communityId,
        });

        const answers = await Answer.find({
          user: userId,
        }).populate({
          path: "question_id",
          match: { community: communityId },
          select: "_id",
        });

        const filteredAnswers = answers.filter((answer) => answer.question_id);

        const answerCount = filteredAnswers.length;

        progress = questionCount + answerCount;
      }
      break;

    case "quizzes":
      // Fetch the latest quiz attempt for the user in this community
      const quizAttempt = await QuizAttempt.findOne({
        user: userId,
        community: communityId,
      })
        .sort({ createdAt: -1 })
        .exec();
      progress = quizAttempt
        ? (quizAttempt.score / quizAttempt.totalPossibleScore) * 100
        : 0;
      break;

    default:
      progress = 0;
  }
  // console.log(`User ${userId} participation for task ${task._id}: ${progress}`);

  return progress;
}

module.exports = {
  createCommunity,
  getAllCommunities,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  getAssessmentTasks,
  getUserParticipation,
  createAssessmentTask,
  updateAssessmentTask,
  deleteAssessmentTask,
  getAssessmentTasksWithProgress,
};
