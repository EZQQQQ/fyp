// frontend/src/components/Dashboard.js

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, updateHideDashboardPreference } from "../features/userSlice";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ExploreIcon from "@mui/icons-material/Explore";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import QuizIcon from "@mui/icons-material/Quiz";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PolicyIcon from "@mui/icons-material/Policy";

function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [showInstructions, setShowInstructions] = useState(true);
  const [doNotRemind, setDoNotRemind] = useState(false);

  useEffect(() => {
    if (user) {
      setDoNotRemind(user.hideDashboard);
      setShowInstructions(!user.hideDashboard);
    }
  }, [user]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setDoNotRemind(checked);
  };

  const handleProceed = () => {
    if (doNotRemind) {
      dispatch(updateHideDashboardPreference(true));
    }
    setShowInstructions(false);
  };

  const studentInstructions = [
    "View questions with filters from communities related to your modules (password provided by your professor).",
    "Search for specific questions easily.",
    "Explore communities based on your coursework.",
    "Upload questions and share your knowledge with your classmates (supports text, images, videos, PDFs).",
    "Provide answers to your peers' questions (supports text and images).",
    "Upvote or downvote content to promote quality contributions.",
    "Monitor your progress on assessment tasks within each community.",
    "Follow community guidelines set by your professor and maintain respect.",
    "Enjoy sharing and learning!",
  ];

  const professorInstructions = [
    "Assign assessment tasks to students.",
    "Create communities based on different modules.",
    "Develop quizzes for student evaluations.",
    "Manage and oversee student questions.",
    "Moderate community interactions effectively.",
    "Provide constructive feedback to students.",
    "Foster a collaborative learning environment!",
  ];

  const instructions =
    user.role === "student" ? studentInstructions : professorInstructions;

  const instructionIcons =
    user.role === "student"
      ? [
        <HomeIcon style={{ color: "#DBA351", marginRight: "8px" }} />,
        <SearchIcon style={{ color: "#D99D51", marginRight: "8px" }} />,
        <ExploreIcon style={{ color: "#D9C16E", marginRight: "8px" }} />,
        <CloudUploadIcon style={{ color: "#97BC98", marginRight: "8px" }} />,
        <QuestionAnswerIcon style={{ color: "#7AAF7C", marginRight: "8px" }} />,
        <ArrowUpwardIcon style={{ color: "#87B3D5", marginRight: "8px" }} />,
        <InsertChartIcon style={{ color: "#63A2D3", marginRight: "8px" }} />,
        <EmojiEmotionsIcon style={{ color: "#A567AF", marginRight: "8px" }} />,
        <EmojiEmotionsIcon style={{ color: "#A567AF", marginRight: "8px" }} />,
      ]
      : [
        <AssessmentIcon style={{ color: "#DBA351", marginRight: "8px" }} />,
        <ExploreIcon style={{ color: "#D99D51", marginRight: "8px" }} />,
        <QuizIcon style={{ color: "#D9C16E", marginRight: "8px" }} />,
        <PolicyIcon style={{ color: "#97BC98", marginRight: "8px" }} />,
        <ArrowUpwardIcon style={{ color: "#87B3D5", marginRight: "8px" }} />,
        <QuestionAnswerIcon style={{ color: "#63A2D3", marginRight: "8px" }} />,
        <EmojiEmotionsIcon style={{ color: "#A567AF", marginRight: "8px" }} />,
      ];

  if (!showInstructions) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full relative"
        role="document"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleProceed}
          aria-label="Close"
        >
          &#x2715;
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Welcome, {user.name}!
        </h1>
        <h5 className="mb-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {user.role === "student" ? "Features for Students" : "Features for Professors"}
        </h5>
        <ul className="mb-4 text-gray-700 dark:text-gray-300 list-disc list-inside space-y-2">
          {instructions.map((item, index) => (
            <li key={index} className="flex items-start">
              {instructionIcons[index % instructionIcons.length]}
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center mt-4">
          <input
            id="doNotRemind"
            type="checkbox"
            checked={doNotRemind}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            htmlFor="doNotRemind"
            className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Do not remind me again
          </label>
        </div>
        <button
          className="mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          onClick={handleProceed}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}

export default Dashboard;