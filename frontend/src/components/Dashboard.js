// frontend/src/components/Dashboard.js

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, updateHideDashboardPreference } from "../features/userSlice";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PolicyIcon from "@mui/icons-material/Policy";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FlagIcon from "@mui/icons-material/Flag";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyIcon from "@mui/icons-material/Key";
import DownloadIcon from "@mui/icons-material/Download";
import AnnouncementIcon from "@mui/icons-material/Announcement";

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
    "Access module communities using unique codes provided by professors",
    "Create and respond to questions with rich formatting (text, code, images, PDFs)",
    "Upvote helpful content and bookmark questions for later reference",
    "Use the search feature to filter by title, tags, or descriptions",
    "Monitor your progress on assessment tasks and quizzes",
    "Report inappropriate content for moderation",
    "Participate in real-time anonymous chats (messages disappear after 24hrs)",
    "Receive notifications about interactions with your posts",
    "Follow community guidelines set by your professor and maintain respect.",
    "Enjoy sharing and learning!",
  ];

  const professorInstructions = [
    "Create and manage module communities with unique access codes",
    "Design assessment rubrics and create auto-generated quizzes",
    "Export assessment results to Excel for grading purposes",
    "Moderate student interactions and handle reported content",
    "Post announcements and learning materials",
    "Engage in real-time anonymized discussions (24hours TTL messages) with students",
    "Foster a collaborative learning environment!"
  ];

  const instructions =
    user.role === "student" ? studentInstructions : professorInstructions;

  const instructionIcons =
    user.role === "student"
      ? [
        <KeyIcon style={{ color: "#DBA351", marginRight: "8px" }} />,            // Access with unique codes - orange
        <CloudUploadIcon style={{ color: "#D99D51", marginRight: "8px" }} />,    // Create/respond with formatting - orange
        <BookmarkIcon style={{ color: "#D9C16E", marginRight: "8px" }} />,       // Upvote/bookmark - yellow
        <SearchIcon style={{ color: "#D9C16E", marginRight: "8px" }} />,         // Search/filter - yellow
        <AssessmentIcon style={{ color: "#97BC98", marginRight: "8px" }} />,     // Monitor progress - green
        <FlagIcon style={{ color: "#7AAF7C", marginRight: "8px" }} />,           // Report content - green
        <ChatIcon style={{ color: "#87B3D5", marginRight: "8px" }} />,           // Anonymous chats - blue
        <NotificationsIcon style={{ color: "#63A2D3", marginRight: "8px" }} />,  // Notifications - blue
        <PolicyIcon style={{ color: "#A567AF", marginRight: "8px" }} />,         // Community guidelines - purple
        <EmojiEmotionsIcon style={{ color: "#8B44AD", marginRight: "8px" }} />,  // Enjoy learning - purple
      ]
      : [
        <KeyIcon style={{ color: "#DBA351", marginRight: "8px" }} />,            // Create/manage communities
        <AssessmentIcon style={{ color: "#D99D51", marginRight: "8px" }} />,     // Design assessment rubrics
        <DownloadIcon style={{ color: "#D9C16E", marginRight: "8px" }} />,       // Export results
        <PolicyIcon style={{ color: "#97BC98", marginRight: "8px" }} />,         // Moderate interactions
        <AnnouncementIcon style={{ color: "#7AAF7C", marginRight: "8px" }} />,   // Post announcements
        <ChatIcon style={{ color: "#87B3D5", marginRight: "8px" }} />,           // Real-time discussions
        <EmojiEmotionsIcon style={{ color: "#63A2D3", marginRight: "8px" }} />, // Participate in discussions
      ];

  if (!showInstructions) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg relative"
        role="document"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleProceed}
          aria-label="Close"
        >
          &#x2715;
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Welcome, {user.name}!
        </h1>
        <h5 className="mb-3 text-base sm:text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
          {user.role === "student" ? "Features for Students" : "Features for Professors"}
        </h5>
        <ul className="mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside space-y-2">
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
            className="ml-2 text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-gray-300"
          >
            Do not remind me again
          </label>
        </div>
        <button
          className="mt-4 flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          onClick={handleProceed}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}

export default Dashboard;