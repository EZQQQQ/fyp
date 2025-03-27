// backend/routers/communityChat.js
const express = require('express');
const router = express.Router();
const chatMessageFilter = require('../middlewares/chatMessageFilter');
const CommunityChatController = require('../controllers/communityChatController');

/**
 * @swagger
 * tags:
 *   name: CommunityChat
 *   description: API for managing community chat messages
 */

/**
 * @swagger
 * /api/chat/{communityId}/join:
 *   post:
 *     summary: Join a community chat room
 *     tags: [CommunityChat]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the community chat to join.
 *     responses:
 *       200:
 *         description: Successfully joined chat room.
 *       400:
 *         description: Bad request.
 */
router.post('/:communityId/join', CommunityChatController.joinChat);

/**
 * @swagger
 * /api/chat/{communityId}/leave:
 *   post:
 *     summary: Leave a community chat room
 *     tags: [CommunityChat]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the community chat to leave.
 *     responses:
 *       200:
 *         description: Successfully left chat room.
 *       400:
 *         description: Bad request.
 */
router.post('/:communityId/leave', CommunityChatController.leaveChat);

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send a chat message
 *     tags: [CommunityChat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               communityId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/message', chatMessageFilter, CommunityChatController.sendMessage);

/**
 * @swagger
 * /api/chat/{communityId}/messages:
 *   get:
 *     summary: Get chat messages for a community
 *     tags: [CommunityChat]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the community chat.
 *     responses:
 *       200:
 *         description: Returns a list of chat messages.
 *       400:
 *         description: Bad request.
 */
router.get('/:communityId/messages', CommunityChatController.getMessages);

module.exports = router;
