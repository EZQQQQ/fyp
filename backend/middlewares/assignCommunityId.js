// /backend/middlewares/assignCommunityId.js
const mongoose = require("mongoose");

const assignCommunityId = (req, res, next) => {
  req.communityId = new mongoose.Types.ObjectId();
  next();
};

module.exports = assignCommunityId;
