// /backend/controllers/communityController.js

const Community = require("../models/Community");
const User = require("../models/User");
const path = require("path");

// Create a new community
const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user._id;

    let avatar = "/uploads/defaults/default-avatar.jpeg"; // Default avatar path

    // Check if avatar was uploaded
    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
      // Assuming the server serves static files from '/uploads'
      avatar = `/uploads/communityAvatars/${req.files.avatar[0].filename}`;
      console.log("Avatar uploaded:", avatar); // Logging
    }

    const community = new Community({
      name,
      description,
      createdBy,
      members: [createdBy], // Initial member is the creator
      avatar, // Set avatar path
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

// Fetch user's communities
const getUserCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({
      members: req.user._id,
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(200).json({
      status: true,
      communities,
    });
  } catch (error) {
    next(error);
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

module.exports = {
  createCommunity,
  getAllCommunities,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
};
