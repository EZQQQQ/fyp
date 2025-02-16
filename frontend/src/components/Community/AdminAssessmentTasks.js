// frontend/src/components/Community/AdminAssessmentTasks.js
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAssessmentTask,
  updateAssessmentTask,
  deleteAssessmentTask,
  fetchAssessmentTasks,
  fetchAllParticipation  // import the new thunk
} from "../../features/assessmentSlice";

import { Typography, Button } from "@material-tailwind/react";
import { toast } from "react-toastify";
import CustomDialog from "../Modal/CustomDialog";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// Import the Excel export and grouping functions
import { exportAssessmentResultsToExcel } from "../../exporters/exportAssessmentResults";
import { groupParticipationByStudent } from "../../exporters/groupParticipation";

function AdminAssessmentTasks({ communityId }) {
  const dispatch = useDispatch();
  const { tasks, allParticipation, loading, error } = useSelector(
    (state) => state.assessment
  );

  // Fetch assessment tasks on component mount
  useEffect(() => {
    if (communityId) {
      dispatch(fetchAssessmentTasks(communityId));
      dispatch(fetchAllParticipation(communityId)); // fetch participation for all members
    }
  }, [dispatch, communityId]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const [formData, setFormData] = useState({
    adminLabel: "",
    type: "",
    contentType: "",
    total: "",
    weight: "",
    quizNumber: "",
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDialog = (task = null) => {
    setCurrentTask(task);
    if (task) {
      setFormData({
        adminLabel: task.adminLabel || "",
        type: task.type,
        contentType: task.contentType || "",
        total: task.total,
        weight: task.weight,
        quizNumber: task.quizNumber || "",
      });
    } else {
      setFormData({
        adminLabel: "",
        type: "",
        contentType: "",
        total: "",
        weight: "",
        quizNumber: "",
      });
    }
    setIsDialogOpen(true);
    setMenuOpen(false);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentTask(null);
    setFormData({
      adminLabel: "",
      type: "",
      contentType: "",
      total: "",
      weight: "",
      quizNumber: "",
    });
  };

  const handleChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };

  const generateStudentLabel = () => {
    const { type, contentType, total, quizNumber } = formData;
    if (!type) return "";
    let label = "";
    switch (type) {
      case "votes":
        if (contentType === "questions & answers") {
          label = `Achieve a total of ${total} votes on questions and answers`;
        } else if (contentType === "questions") {
          label = `Achieve a total of ${total} votes on questions`;
        } else if (contentType === "answers") {
          label = `Achieve a total of ${total} votes on answers`;
        }
        break;
      case "postings":
        if (contentType === "questions") {
          label = `Post ${total} questions`;
        } else if (contentType === "answers") {
          label = `Provide ${total} answers`;
        } else if (contentType === "both") {
          label = `Make ${total} posts (questions or answers)`;
        }
        break;
      case "quizzes":
        label = `Complete quiz ${quizNumber || 1}`;
        break;
      default:
        label = `Assessment Task`;
    }
    return label;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!formData.adminLabel) {
      toast.error("Admin Label is required.");
      return;
    }
    const studentLabel = generateStudentLabel();
    const payload = {
      adminLabel: formData.adminLabel,
      label: studentLabel,
      type: formData.type,
      contentType: formData.contentType,
      total: formData.total ? Number(formData.total) : 0,
      weight: formData.weight ? Number(formData.weight) : 0,
      quizNumber: formData.type === "quizzes" ? formData.quizNumber : undefined,
    };
    try {
      if (currentTask) {
        await dispatch(
          updateAssessmentTask({
            communityId,
            taskId: currentTask._id,
            taskData: payload,
          })
        ).unwrap();
        toast.success("Assessment task updated successfully!");
      } else {
        await dispatch(
          createAssessmentTask({ communityId, taskData: payload })
        ).unwrap();
        toast.success("Assessment task created successfully!");
      }
      closeDialog();
      dispatch(fetchAssessmentTasks(communityId));
      dispatch(fetchAllParticipation(communityId));
    } catch (err) {
      console.error("Failed to save assessment task:", err);
      toast.error(err.message || "Failed to save assessment task.");
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await dispatch(deleteAssessmentTask({ communityId, taskId })).unwrap();
        toast.success("Assessment task deleted successfully!");
      } catch (error) {
        console.error("Failed to delete assessment task:", error);
        toast.error(error.message || "Failed to delete assessment task.");
      }
    }
  };

  // Use the new allParticipation data for export.
  const handleExportExcel = () => {
    if (!tasks.length || !allParticipation.length) {
      toast.error("No assessment data available for export.");
      setMenuOpen(false);
      return;
    }
    const groupedParticipation = groupParticipationByStudent(allParticipation);
    exportAssessmentResultsToExcel(tasks, groupedParticipation);
    setMenuOpen(false);
  };

  const isTasksArray = Array.isArray(tasks);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 relative">
        <Typography variant="h6" className="text-gray-900 dark:text-gray-100">
          Assessment Tasks
        </Typography>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <MoreHorizIcon style={{ color: "gray" }} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
              <button
                onClick={() => openDialog()}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Add Task
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Export to Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      )}
      {error && (
        <p className="text-red-500 dark:text-red-400">{error}</p>
      )}

      <ul className="space-y-4">
        {isTasksArray && tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <div>
                <Typography
                  variant="h6"
                  className="text-gray-800 dark:text-gray-200 mb-2"
                >
                  {task.adminLabel}
                </Typography>
                <Typography
                  variant="small"
                  color="gray"
                  className="block text-gray-800 dark:text-gray-200"
                >
                  Type: {task.type}{" "}
                  {task.contentType && `(${task.contentType})`}
                </Typography>
                <Typography
                  variant="small"
                  color="gray"
                  className="block text-gray-800 dark:text-gray-200"
                >
                  Total Required: {task.total} | Weight: {task.weight}%
                </Typography>
                {task.type === "quizzes" && task.quizNumber && (
                  <Typography
                    variant="small"
                    color="gray"
                    className="block text-gray-800 dark:text-gray-200"
                  >
                    Quiz Number: {task.quizNumber}
                  </Typography>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  size="sm"
                  color="blue"
                  onClick={() => openDialog(task)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  color="red"
                  onClick={() => handleDelete(task._id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No assessment tasks available.
          </p>
        )}
      </ul>

      <CustomDialog isOpen={isDialogOpen} onClose={closeDialog} size="md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {currentTask ? "Edit Assessment Task" : "Add Assessment Task"}
          </h2>
          <button
            onClick={closeDialog}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleConfirm} className="space-y-6">
          {/* Form fields go here */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={closeDialog}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800 transition"
            >
              {currentTask ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </CustomDialog>
    </div>
  );
}

export default AdminAssessmentTasks;
