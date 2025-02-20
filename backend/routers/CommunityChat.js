// backend/routers/communityChat.js
const express = require('express');
const router = express.Router();
const chatMessageFilter = require('../middlewares/chatMessageFilter');
const CommunityChatController = require('../controllers/communityChatController');

// POST /api/chat/:communityId/join
router.post('/:communityId/join', CommunityChatController.joinChat);

// POST /api/chat/:communityId/leave (optional, for releasing a name)
router.post('/:communityId/leave', CommunityChatController.leaveChat);

// POST /api/chat/message
router.post('/message', chatMessageFilter, CommunityChatController.sendMessage);

// GET /api/chat/:communityId/messages
router.get('/:communityId/messages', CommunityChatController.getMessages);

module.exports = router;
