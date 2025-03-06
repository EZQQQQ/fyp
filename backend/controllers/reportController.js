// backend/controllers/reportController.js

const Report = require('../models/Report');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Comment = require('../models/Comment');

exports.createReport = async (req, res) => {
  try {
    const { type, itemId } = req.body;
    const reporter = req.user._id;

    const existingReport = await Report.findOne({ type, itemId, reporter });
    if (existingReport) {
      return res.status(409).json({ message: 'You have already reported this item.' });
    }

    const report = await Report.create({ type, itemId, reporter });
    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ reviewed: false }).populate('reporter');

    // Conditionally populate itemId based on type
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        const populatedReport = report.toObject();

        if (report.type === 'question') {
          populatedReport.itemId = await Question.findById(report.itemId);
        } else if (report.type === 'answer') {
          populatedReport.itemId = await Answer.findById(report.itemId);
        } else if (report.type === 'comment') {
          const comment = await Comment.findById(report.itemId);

          if (comment) {
            populatedReport.itemId = comment;

            // For comments on answers, look up the question_id
            if (comment.answer_id) {
              const answer = await Answer.findById(comment.answer_id);
              if (answer && answer.question_id) {
                // Add the question_id to the comment for proper navigation
                populatedReport.itemId.question_id = answer.question_id;
              }
            }
          }
        }

        return populatedReport;
      })
    );

    res.status(200).json({
      status: true,
      data: populatedReports
    });
  } catch (error) {
    console.error("Error getting reports:", error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.reviewReport = async (req, res) => {
  const { reportId } = req.params;

  try {
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found." });

    switch (report.type) {
      case 'question':
        await Question.findByIdAndDelete(report.itemId);
        break;
      case 'answer':
        await Answer.findByIdAndDelete(report.itemId);
        break;
      case 'comment':
        await Comment.findByIdAndDelete(report.itemId);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type." });
    }

    report.reviewed = true;
    await report.save();

    res.status(200).json({ message: "Reported item deleted successfully." });
  } catch (error) {
    console.error("Error reviewing report:", error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.dismissReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Simply delete the report document, not the content it refers to
    const result = await Report.findByIdAndDelete(reportId);

    if (!result) {
      return res.status(404).json({
        status: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      status: true,
      message: "Report dismissed successfully"
    });
  } catch (error) {
    console.error("Error dismissing report:", error);
    res.status(500).json({
      status: false,
      message: error.message || 'Error dismissing report'
    });
  }
};