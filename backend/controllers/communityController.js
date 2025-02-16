// /backend/controllers/communityController.js

const mongoose = require("mongoose");
const config = require('../config');
const Community = require("../models/Community");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const s3BaseUrl = `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com`;

// Create a new community
const createCommunity = async (req, res) => {
  try {
    const { name, description, rules } = req.body;
    const createdBy = req.user._id;

    // Default S3 avatar if none is uploaded
    let avatar = `${s3BaseUrl}/uploads/defaults/default-avatar-user.jpeg`;

    // Check if avatar was uploaded via S3
    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
      // req.files.avatar[0].location is the S3 URL from multer-s3
      avatar = req.files.avatar[0].location;
      console.log("Avatar uploaded:", avatar);
    }

    // Ensure rules is an array
    const parsedRules = Array.isArray(rules) ? rules : [rules];

    const community = new Community({
      name,
      description,
      createdBy,
      members: [createdBy],
      avatar,
      rules: parsedRules,
    });

    await community.save();

    // Update the user's communities array
    await User.findByIdAndUpdate(
      createdBy,
      { $push: { communities: community._id } },
      { new: true }
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
      .populate("createdBy", "name email profilePicture")
      .populate("members", "name email profilePicture");

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

// Get User Communities
const getUserCommunities = async (req, res) => {
  try {
    const userId = req.user.id;

    const communities = await Community.find({
      members: { $in: [userId] },
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

    community.members.push(userId);
    await community.save();

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

    if (!communityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Community ID format" });
    }

    const community = await Community.findById(communityId)
      .populate("createdBy", "name email profilePicture")
      .populate("members", "username email profilePicture")
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

// Check if community name exists
const checkCommunityName = async (req, res) => {
  try {
    const { name } = req.params;
    const existingCommunity = await Community.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });

    if (existingCommunity) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking community name:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Participation Metrics
const getUserParticipation = async (req, res) => {
  const { communityId } = req.params;
  const userId = req.user.id;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const participation = await Promise.all(
      community.assessmentTasks.map(async (task) => {
        const value = await calculateStudentProgress(userId, task, communityId);
        return {
          _id: task._id,
          label: task.label,
          total: task.total,
          studentProgress: value,
          type: task.type,
          adminLabel: task.adminLabel
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
  const { label, adminLabel, type, contentType, total, weight, quizId } = req.body;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const newTask = {
      label,
      adminLabel,
      type,
      contentType,
      total,
      weight,
      ...(type === "quizzes" && { quizId }),
    };

    community.assessmentTasks.push(newTask);
    await community.save();

    const createdTask =
      community.assessmentTasks[community.assessmentTasks.length - 1];

    // console.log("Received assessment task payload:", req.body);
    // console.log("Creating newTask:", newTask);


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
  const { label, adminLabel, type, contentType, total, weight, quizId } = req.body;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const task = community.assessmentTasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Assessment task not found." });
    }

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

    const task = community.assessmentTasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Assessment task not found." });
    }

    community.assessmentTasks.pull(taskId);
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
  // console.log(`Calculating progress for task ${task._id}:`, task);

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
      if (task.quizId) {
        // console.log(`Calculating quiz progress for task ${task._id} with quizId ${task.quizId}`);
        const quizAttempt = await QuizAttempt.findOne({
          user: userId,
          community: communityId,
          quiz: task.quizId,
        }).sort({ createdAt: -1 }).exec();
        if (quizAttempt) {
          // console.log("Found quiz attempt:", quizAttempt);
          progress = (quizAttempt.score / quizAttempt.totalPossibleScore) * 100;
        } else {
          // console.log("No quiz attempt found for task.quizId:", task.quizId);
          progress = 0;
        }
      } else {
        // console.log("Task has no quizId");
        progress = 0;
      }
      break;
    default:
      progress = 0;
  }
  // console.log(`User ${userId} participation for task ${task._id}: ${progress}`);

  return progress;
}

/**
 * Get all participation data for all members of a community.
 *
 * For each assessment task in the community and for each member,
 * this function calculates the student's progress for that task.
 * It returns an array where each element is an object with the following structure:
 * {
 *   _id: task._id,                // task result identifier (task id)
 *   label: task.label,
 *   total: task.total,
 *   studentProgress: <calculated progress>,
 *   type: task.type,
 *   adminLabel: task.adminLabel,
 *   studentId: member._id,
 *   studentName: member.name,
 *   studentEmail: member.email
 * }
 */
async function getAllParticipation(req, res) {
  const { communityId } = req.params;

  try {
    const community = await Community.findById(communityId)
      .populate("members", "name email")
      .exec();

    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const allParticipation = [];

    // Loop through each assessment task in the community.
    for (const task of community.assessmentTasks) {
      // Loop through each member in the community.
      for (const member of community.members) {
        // Calculate progress for this member on the current task.
        const progress = await calculateStudentProgress(member._id, task, communityId);
        allParticipation.push({
          _id: task._id,
          label: task.label,
          total: task.total,
          studentProgress: progress,
          type: task.type,
          adminLabel: task.adminLabel,
          studentId: member._id,
          studentName: member.name,
          studentEmail: member.email,
        });
      }
    }

    res.json({ participation: allParticipation });
  } catch (error) {
    console.error("Error fetching all participation:", error);
    res.status(500).json({ message: "Server error." });
  }
}

module.exports = {
  createCommunity,
  getAllCommunities,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  checkCommunityName,
  getAssessmentTasks,
  getUserParticipation,
  getAllParticipation,
  createAssessmentTask,
  updateAssessmentTask,
  deleteAssessmentTask,
  getAssessmentTasksWithProgress,
};
