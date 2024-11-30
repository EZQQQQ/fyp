// /frontend/src/components/Community/AdminAssessmentTasks.js

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAssessmentTask,
  updateAssessmentTask,
  deleteAssessmentTask,
  fetchAssessmentTasks,
} from "../../features/assessmentSlice";

import { Typography, Button } from "@material-tailwind/react";
import { toast } from "react-toastify";
import CustomDialog from "../Modal/CustomDialog";

function AdminAssessmentTasks({ communityId }) {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.assessment);

  // Fetch assessment tasks on component mount
  useEffect(() => {
    if (communityId) {
      dispatch(fetchAssessmentTasks(communityId));
    }
  }, [dispatch, communityId]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Updated formData to include adminLabel
  const [formData, setFormData] = useState({
    adminLabel: "",
    type: "",
    contentType: "",
    total: "",
    weight: "",
  });

  const openDialog = (task = null) => {
    setCurrentTask(task);
    if (task) {
      setFormData({
        adminLabel: task.adminLabel || "",
        type: task.type,
        contentType: task.contentType || "",
        total: task.total,
        weight: task.weight,
      });
    } else {
      setFormData({
        adminLabel: "",
        type: "",
        contentType: "",
        total: "",
        weight: "",
      });
    }
    setIsDialogOpen(true);
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
    });
  };

  // Handle form field changes
  const handleChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };

  // Generate student-facing label
  const generateStudentLabel = () => {
    const { type, contentType, total } = formData;
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
        label = `Complete quizzes`;
        break;
      default:
        label = `Assessment Task`;
    }

    return label;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.adminLabel) {
      toast.error("Admin Label is required.");
      return;
    }

    // Generate student label
    const studentLabel = generateStudentLabel();

    const payload = {
      adminLabel: formData.adminLabel,
      label: studentLabel,
      type: formData.type,
      contentType: formData.contentType,
      total: formData.total ? Number(formData.total) : 0,
      weight: formData.weight ? Number(formData.weight) : 0,
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

  // Defensive Coding: Ensure tasks is an array
  const isTasksArray = Array.isArray(tasks);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <Typography variant="h6" className="text-gray-900 dark:text-gray-100">
          Assessment Tasks
        </Typography>
        <Button
          onClick={() => openDialog()}
          size="sm"
          className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700"
        >
          Add Task
        </Button>
      </div>

      {/* Loading and Error Messages */}
      {loading && (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      )}
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {/* Task List */}
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
                <Typography variant="small" color="gray" className="block">
                  Type: {task.type}{" "}
                  {task.contentType && `(${task.contentType})`}
                </Typography>
                <Typography variant="small" color="gray" className="block">
                  Total Required: {task.total} | Weight: {task.weight}%
                </Typography>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  size="sm"
                  color="blue"
                  onClick={() => openDialog(task)}
                  className="bg-green-600 hover:bg-green-700"
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

      {/* Custom Dialog for Adding/Editing Tasks */}
      <CustomDialog isOpen={isDialogOpen} onClose={closeDialog} size="md">
        {/* Dialog Header */}
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

        {/* Dialog Form */}
        <form onSubmit={handleConfirm} className="space-y-6">
          {/* Admin Label Input */}
          <div className="flex flex-col">
            <label
              htmlFor="adminLabel"
              className="mb-2 text-gray-700 dark:text-gray-300 font-medium"
            >
              Admin Label
            </label>
            <input
              id="adminLabel"
              name="adminLabel"
              type="text"
              value={formData.adminLabel}
              onChange={(e) => handleChange(e.target.value, "adminLabel")}
              required
              className="bg-gray-50 border border-gray-300 text-base sm:text-lg text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 
                         block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                         dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter admin label"
            />
          </div>

          {/* Type Selection */}
          <div className="flex flex-col">
            <label
              htmlFor="type"
              className="mb-2 text-gray-700 dark:text-gray-300 font-medium"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={(e) => handleChange(e.target.value, "type")}
              required
              className="bg-gray-50 border border-gray-300 text-base sm:text-lg text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 
                         block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                         dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="votes">Votes</option>
              <option value="postings">Postings</option>
              <option value="quizzes">Quizzes</option>
            </select>
          </div>

          {/* Content Type Selection (Conditional) */}
          {(formData.type === "votes" || formData.type === "postings") && (
            <div className="flex flex-col">
              <label
                htmlFor="contentType"
                className="mb-2 text-gray-700 dark:text-gray-300 font-medium"
              >
                Content Type
              </label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={(e) => handleChange(e.target.value, "contentType")}
                required
                className="bg-gray-50 border border-gray-300 text-base sm:text-lg text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 
                           block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                           dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select Content Type</option>
                {/* For Votes */}
                {formData.type === "votes" && (
                  <>
                    <option value="questions & answers">
                      Questions & Answers
                    </option>
                    <option value="questions">Questions</option>
                    <option value="answers">Answers</option>
                  </>
                )}
                {/* For Postings */}
                {formData.type === "postings" && (
                  <>
                    <option value="questions">Questions</option>
                    <option value="answers">Answers</option>
                    <option value="both">Both</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Total Required */}
          {(formData.type === "votes" ||
            formData.type === "postings" ||
            formData.type === "quizzes") && (
            <div className="flex flex-col">
              <label
                htmlFor="total"
                className="mb-2 text-gray-700 dark:text-gray-300 font-medium"
              >
                {formData.type === "quizzes"
                  ? "Quiz Details"
                  : "Total Required"}
              </label>
              <input
                id="total"
                name="total"
                type="number"
                value={formData.total}
                onChange={(e) => handleChange(e.target.value, "total")}
                required={formData.type !== "quizzes"}
                min="1"
                className="bg-gray-50 border border-gray-300 text-base sm:text-lg text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 
                           block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                           dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={
                  formData.type === "quizzes"
                    ? "Leave blank if not applicable"
                    : "Enter count"
                }
              />
              {formData.type === "quizzes" && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  For quizzes, only specify the weight percentage.
                </p>
              )}
            </div>
          )}

          {/* Weight */}
          <div className="flex flex-col">
            <label
              htmlFor="weight"
              className="mb-2 text-gray-700 dark:text-gray-300 font-medium"
            >
              Weight (%)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange(e.target.value, "weight")}
              required
              min="0"
              max="100"
              className="bg-gray-50 border border-gray-300 text-base sm:text-lg text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 
                         block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                         dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter weight percentage"
            />
          </div>

          {/* Submit and Cancel Buttons */}
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
