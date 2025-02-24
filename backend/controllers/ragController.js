// /backend/controllers/ragController.js
const pdfParse = require('pdf-parse');
const openai = require('../utils/openaiClient');

/**
 * Helper: Chunk text into pieces of approximately maxTokens words.
 */
function chunkText(text, maxTokens = 500) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const chunks = [];
  let currentChunk = '';
  for (const line of lines) {
    const currentCount = currentChunk.split(' ').length;
    const lineCount = line.split(' ').length;
    if ((currentCount + lineCount) > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = line;
    } else {
      currentChunk += ' ' + line;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

/**
 * Process PDF for RAG.
 * Extracts text from the uploaded PDF (from memory), chunks the text, and generates embeddings for each chunk.
 */
async function processPDFForRAG(req, res) {
  try {
    // Use the in-memory buffer for PDF processing
    const data = await pdfParse(req.file.buffer);
    const text = data.text;
    const chunks = chunkText(text, 500);

    const embeddings = [];
    for (const chunk of chunks) {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      });
      embeddings.push(response.data.data[0].embedding);
    }

    res.json({ chunks, embeddings });
  } catch (error) {
    console.error("Error processing PDF for RAG:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Utility: Compute cosine similarity between two vectors.
 */
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

/**
 * Generate a RAG response for a given query.
 * Computes the query's embedding, retrieves the top 3 most similar chunks, and uses GPT-4o to generate an answer.
 */
async function generateRAGResponse(req, res) {
  try {
    const { query, chunks, embeddings } = req.body;

    const queryResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    const queryEmbedding = queryResponse.data.data[0].embedding;

    const similarities = embeddings.map(embed => cosineSimilarity(queryEmbedding, embed));
    const topKIndices = similarities
      .map((sim, idx) => ({ sim, idx }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3)
      .map(item => item.idx);

    const relevantContext = topKIndices.map(idx => chunks[idx]).join("\n\n");

    const systemPrompt = `
      You will be provided with an input prompt and context that contains relevant information.
      Using the context, provide a concise and direct answer to the input prompt.
      `;

    const prompt = `INPUT PROMPT:
      ${query}

      CONTEXT:
      ${relevantContext}

      ANSWER:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error("Error generating RAG response:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { processPDFForRAG, generateRAGResponse };
