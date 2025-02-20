// backend/models/CommunityChat.js
const mongoose = require('mongoose');

const communityChatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  }, // the anonymous name
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a TTL index so that messages are removed 24 hours (86400 seconds) after creation.
communityChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('ChatMessage', communityChatMessageSchema);
