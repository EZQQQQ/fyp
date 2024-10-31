// /backend/controllers/communityController.js

const Community = require("../models/Community");
const User = require("../models/User");

// Create a new community
const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user._id;

    const community = new Community({
      name,
      description,
      createdBy,
      members: [createdBy], // Initial member is the creator
    });

    await community.save();

    res.status(201).json({
      status: true,
      message: "Community created successfully.",
      data: community,
    });
  } catch (error) {
    console.error("Error creating community:", error);
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
  joinCommunity,
  leaveCommunity,
};
