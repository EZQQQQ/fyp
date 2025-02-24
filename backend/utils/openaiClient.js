// backend/utils/openaiClient.js
require('dotenv').config();
const OpenAI = require('openai').default;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


module.exports = openai;
