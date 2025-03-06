import axiosInstance from '../utils/axiosConfig';
import questionService from './questionService';

// Report an item (question, answer, or comment)
export const reportItem = async (type, itemId) => {
  try {
    const response = await axiosInstance.post('/report', {
      type,
      itemId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch all reports (for admins)
export const getReports = async () => {
  try {
    const response = await axiosInstance.get('/report');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Delete a reported item or its corresponding report
export const deleteReportedItem = async (id, type) => {
  try {
    // console.log(`Attempting to delete ${type} with ID: ${id}`);

    if (!id) {
      throw new Error("No ID provided for deletion");
    }

    let response;

    // For reports page, we should use the report review endpoint
    // which will handle both the content and report deletion
    if (type === 'report') {
      response = await axiosInstance.delete(`/report/${id}`);
    } else {
      // For direct content deletion, use the correct paths without /api prefix
      switch (type) {
        case 'question':
          response = await axiosInstance.delete(`/question/${id}`);
          break;
        case 'answer':
          response = await axiosInstance.delete(`/answer/${id}`);
          break;
        case 'comment':
          response = await axiosInstance.delete(`/comment/${id}`);
          break;
        default:
          response = await axiosInstance.delete(`/report/${id}`);
      }
    }

    return response.data;
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    throw error;
  }
};

// Dismiss a report (for admins & professors)
export const dismissReport = async (reportId) => {
  try {
    // Changed from /reports/ to /report/
    const response = await axiosInstance.put(`/report/${reportId}/dismiss`);
    return response.data;
  } catch (error) {
    console.error('Error dismissing report:', error);
    throw error;
  }
};