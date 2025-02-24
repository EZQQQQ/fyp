// /backend/routers/Rag.js
const express = require('express');
const router = express.Router();
const uploadMemory = require('../middlewares/uploadMemory');
const { processPDFForRAG, generateRAGResponse } = require('../controllers/ragController');

// Endpoint to upload and process a PDF for RAG
router.post('/rag/pdf', uploadMemory.single('document'), processPDFForRAG);

// Endpoint to generate a response given a query and stored RAG data
router.post('/rag/response', generateRAGResponse);

module.exports = router;
