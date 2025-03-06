// backend/routers/Report.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const reportController = require('../controllers/reportController');

router.post('/', auth, reportController.createReport); // students
router.get('/', auth, authorize('professor', 'admin'), reportController.getAllReports); // professors/admins
router.delete('/:reportId', auth, authorize('professor', 'admin'), reportController.reviewReport);
router.put('/:reportId/dismiss', auth, authorize('professor', 'admin'), reportController.dismissReport);

module.exports = router;