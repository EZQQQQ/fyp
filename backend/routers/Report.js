// backend/routers/Report.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const reportController = require('../controllers/reportController');

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: API for managing reports
 */

/**
 * @swagger
 * /api/report:
 *   post:
 *     summary: Create a report (students)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportContent:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post('/', auth, reportController.createReport);

/**
 * @swagger
 * /api/report:
 *   get:
 *     summary: Get all reports (professor/admin)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of reports.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get('/', auth, authorize('professor', 'admin'), reportController.getAllReports);

/**
 * @swagger
 * /api/report/{reportId}:
 *   delete:
 *     summary: Review (delete) a report (professor/admin)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: Report ID.
 *     responses:
 *       200:
 *         description: Report reviewed (deleted) successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.delete('/:reportId', auth, authorize('professor', 'admin'), reportController.reviewReport);

/**
 * @swagger
 * /api/report/{reportId}/dismiss:
 *   put:
 *     summary: Dismiss a report (professor/admin)
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: Report ID.
 *     responses:
 *       200:
 *         description: Report dismissed successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.put('/:reportId/dismiss', auth, authorize('professor', 'admin'), reportController.dismissReport);

module.exports = router;
