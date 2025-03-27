// /backend/routers/Rag.js
const express = require('express');
const router = express.Router();
const uploadMemory = require('../middlewares/uploadMemory');
const { processPDFForRAG, generateRAGResponse } = require('../controllers/ragController');

/**
 * @swagger
 * tags:
 *   name: RAG
 *   description: API for Retrieval Augmented Generation (RAG) operations
 */

/**
 * @swagger
 * /api/rag/pdf:
 *   post:
 *     summary: Upload and process a PDF for RAG
 *     tags: [RAG]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PDF processed successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/rag/pdf', uploadMemory.single('document'), processPDFForRAG);

/**
 * @swagger
 * /api/rag/response:
 *   post:
 *     summary: Generate a response based on a query and stored RAG data
 *     tags: [RAG]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response generated successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/rag/response', generateRAGResponse);

module.exports = router;
