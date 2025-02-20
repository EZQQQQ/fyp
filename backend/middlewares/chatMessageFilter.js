// backend/middlewares/chatMessageFilter.js

const { RegExpMatcher, TextCensor, englishDataset, englishRecommendedTransformers } = require('obscenity');

// Create a matcher instance using the English preset.
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// Create a TextCensor instance.
const censor = new TextCensor();

/**
 * Middleware to censor profanity from chat message content.
 * It assumes that the incoming request has a JSON body with a 'content' field.
 */
module.exports = (req, res, next) => {
  if (req.body && req.body.content) {
    // Get all matches from the input text.
    const matches = matcher.getAllMatches(req.body.content);
    // Censor the text using the matcher results.
    req.body.content = censor.applyTo(req.body.content, matches);
  }
  next();
};
