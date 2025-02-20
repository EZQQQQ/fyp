// backend/controllers/communityChatController.js
const fs = require('fs');
const path = require('path');
const CommunityChat = require('../models/CommunityChat');

// In‑memory store for assigned names per community.
// Format: { communityId: Set([name1, name2, ...]) }
const assignedNames = {};

// Helper: Asynchronously load a list of words from a text file (one word per line)
const loadWordList = async (filename) => {
  const filePath = path.join(__dirname, '..', filename);
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content.split(/\r?\n/).filter(line => line.trim().length > 0);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// Word lists (initialized asynchronously)
let adjectives = [];
let animals = [];

// Immediately-invoked async function to load the word lists.
(async () => {
  adjectives = await loadWordList('adjectives.txt');
  animals = await loadWordList('animals.txt');
})();

const generateRandomName = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective}-${animal}`;
};

const joinChat = async (req, res) => {
  try {
    const { communityId } = req.params;
    if (!communityId) {
      return res.status(400).json({ message: 'Community ID is required.' });
    }

    // Ensure we have a Set for this community
    if (!assignedNames[communityId]) {
      assignedNames[communityId] = new Set();
    }

    let name;
    let attempts = 0;
    // Try up to 10 times to generate a unique name
    do {
      name = generateRandomName();
      attempts++;
      if (attempts > 10) break;
    } while (assignedNames[communityId].has(name));

    // Mark the name as assigned
    assignedNames[communityId].add(name);

    // Return the unique anonymous name
    return res.json({ name });
  } catch (error) {
    console.error('Error in joinChat:', error);
    return res.status(500).json({ message: 'Error joining chat', error: error.message });
  }
};

const leaveChat = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { name } = req.body;
    if (communityId && name && assignedNames[communityId]) {
      assignedNames[communityId].delete(name);
    }
    return res.json({ message: 'Name released' });
  } catch (error) {
    console.error('Error in leaveChat:', error);
    return res.status(500).json({ message: 'Error leaving chat', error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    // Assuming req.body has the necessary fields: content, sender, communityId, createdAt, etc.
    const messageData = req.body;
    // Save the chat message to the database.
    const newMessage = await CommunityChat.create(messageData);
    return res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      message: 'Error sending message',
      error: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const messages = await CommunityChat.find({ communityId }).sort({ createdAt: 1 });
    return res.json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ message: "Error fetching chat messages", error: error.message });
  }
};

module.exports = {
  joinChat,
  leaveChat,
  sendMessage,
  getMessages,
};
