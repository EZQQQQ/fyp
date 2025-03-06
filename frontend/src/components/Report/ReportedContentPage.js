// frontend/src/components/Report/ReportedContentPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { getReports, deleteReportedItem, dismissReport } from '../../services/reportService';
import TextContent from '../ViewQuestion/TextContent';
import { toast } from 'react-toastify';

export default function ReportedContentPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    getReports()
      .then((data) => {
        setReports(data || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch reports");
      });
  };

  const handleDeleteItem = (reportId, type) => {
    if (window.confirm('Remove reported item permanently?')) {
      // When deleting from the reports page, pass 'report' as the type
      // This indicates we're using the report system to handle the deletion
      deleteReportedItem(reportId, 'report')
        .then(() => {
          fetchReports();
          toast.success(`${type || 'Item'} removed successfully`);
        })
        .catch(err => {
          console.error("Error deleting item:", err);
          const errorMsg = err.response?.data?.message || "Failed to remove item";
          toast.error(errorMsg);
        });
    }
  };

  const handleDismissReport = (reportId) => {
    if (window.confirm('Dismiss this report? This will keep the content but remove the report.')) {
      dismissReport(reportId)
        .then(() => {
          fetchReports();
          toast.success("Report dismissed successfully");
        })
        .catch(err => {
          console.error("Error dismissing report:", err);
          const errorMsg = err.response?.data?.message || "Failed to dismiss report";
          toast.error(errorMsg);
        });
    }
  };

  const getContentLink = (report) => {
    if (!report.itemId) return '#';

    switch (report.type) {
      case 'question':
        return `/question/${report.itemId._id}`;
      case 'answer':
        return report.itemId.question_id ? `/question/${report.itemId.question_id}` : '#';
      case 'comment':
        // Check for different types of comment structures
        if (report.itemId.question_id) {
          // Direct comment on a question
          return `/question/${report.itemId.question_id}`;
        } else if (report.itemId.answer_id && report.itemId.answer_id.question_id) {
          // Comment on an answer, and we have the full answer object with question_id
          return `/question/${report.itemId.answer_id.question_id}`;
        } else if (report.itemId.answer_id) {
          // Comment on an answer, but we only have the answer ID
          console.log("Warning: Missing question_id for answer comment");
          return '#';
        }
        return '#';
      default:
        return '#';
    }
  };

  const getContentText = (report) => {
    if (!report.itemId) return 'Content unavailable';

    if (report.type === 'question') return report.itemId.title;
    if (report.type === 'answer') return report.itemId.answer;
    if (report.type === 'comment') return report.itemId.comment;
    return 'Content unavailable';
  };

  // Function to determine the content type for TextContent component
  const getContentType = (report) => {
    if (report.type === 'question') return 'question';
    if (report.type === 'answer') return 'answer';
    if (report.type === 'comment') return 'comment';
    return 'text';
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Reported Content</h1>
      {reports.length === 0 && <p>No reports found.</p>}

      {reports.map((report) => (
        <div key={report._id} className="p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded shadow-sm">
          <p><strong>Type:</strong> {report.type}</p>
          <p><strong>Reported by:</strong> {report.reporter?.username || 'Unknown'}</p>
          <div className="mt-2 mb-2">
            <strong>Content:</strong>
            <div className="mt-1 p-3 bg-white dark:bg-gray-700 rounded max-h-40 overflow-y-auto">
              {report.itemId ? (
                <TextContent
                  content={getContentText(report)}
                  type={getContentType(report)}
                />
              ) : (
                <span className="text-gray-500">Deleted or unavailable</span>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-3">
            {report.itemId && (
              <Link
                to={getContentLink(report)}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Content
              </Link>
            )}

            <button
              onClick={() => handleDeleteItem(report._id, report.type)}
              className="text-red-600 flex items-center gap-1"
            >
              <DeleteForeverIcon /> Remove Item
            </button>

            <button
              onClick={() => handleDismissReport(report._id)}
              className="text-gray-600 hover:text-gray-800"
            >
              Dismiss Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}