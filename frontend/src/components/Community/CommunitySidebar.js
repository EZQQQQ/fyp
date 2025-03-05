// frontend/src/components/Community/CommunitySidebar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import communityService from "../../services/communityService";
import UserAvatar from "../../common/UserAvatar";
import AssessmentTasks from "./AssessmentTasks";
import AdminAssessmentTasks from "./AdminAssessmentTasks";

function CommunitySidebar({
  community,
  communityId,
  user,
  quizzes,
  handleDeleteQuiz,
  handleLeave,
  handleRefreshCode
}) {
  const navigate = useNavigate();
  const assessment = useSelector((state) => state.assessment);

  // Check user roles
  const isAdmin = user && (user.role === "professor" || user.role === "admin");
  const isStudent = user && user.role === "student";

  // For collapsible sections
  const [assessmentExpanded, setAssessmentExpanded] = useState(!isStudent);
  const [membersExpanded, setMembersExpanded] = useState(!isStudent);

  const handleCreateQuiz = () => {
    navigate(`/communities/${communityId}/create-quiz`);
  };

  return (
    <div className="space-y-4">
      {/* Community Code Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold my-2 text-gray-900 dark:text-gray-100">
            Community Code
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {community.communityCode}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleRefreshCode}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
          >
            <RefreshIcon />
          </button>
        )}
      </div>

      {/* Community Description */}
      <div>
        <h2 className="text-xl font-semibold my-2 text-gray-900 dark:text-gray-100">
          Description
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          {community.description || "No description provided for this community."}
        </p>
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />

      {/* Community Rules */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Community Rules
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
          {community.rules && community.rules.length > 0 ? (
            community.rules.map((rule, index) => <li key={index}>{rule}</li>)
          ) : (
            <li>No specific rules set for this community.</li>
          )}
        </ul>
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />

      {/* Quizzes Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Quizzes
          </h2>
          {isAdmin && (
            <Button
              onClick={handleCreateQuiz}
              size="sm"
              className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700"
            >
              Create Quiz
            </Button>
          )}
        </div>
        {quizzes.length > 0 ? (
          <ul className="text-gray-700 dark:text-gray-300">
            {quizzes.map((quiz, index) => (
              <li key={quiz._id} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <div className="pr-2 break-words">
                    {quiz.title.toLowerCase().includes("quiz")
                      ? quiz.title
                      : `Quiz ${index + 1}: ${quiz.title}`}
                  </div>
                  <div className="flex-shrink-0 space-x-2 mt-1">
                    {isAdmin ? (
                      <>
                        <Button
                          onClick={() => navigate(`/quiz/${quiz._id}/edit`)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </>
                    ) : !quiz.hasAttempted ? (
                      <button
                        onClick={() => navigate(`/quiz/${quiz._id}/instructions`)}
                        className="border border-gray-300 dark:border-gray-600 text-black dark:text-white text-xs sm:text-sm px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Take
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          navigate(`/quiz/${quiz._id}/attempt/${quiz.attemptId}/results`)
                        }
                        className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 text-xs sm:text-sm px-2 py-1 rounded-md hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white dark:hover:text-white transition-colors duration-200"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No Quizzes currently.</p>
        )}
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />

      {/* Assessment Tasks Section */}
      <div className="mb-2">
        <div
          className={`flex items-center justify-between ${isStudent ? "cursor-pointer" : ""}`}
          onClick={isStudent ? () => setAssessmentExpanded((prev) => !prev) : undefined}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {isStudent ? "Your Progress" : ""}
          </h2>
          {isStudent && (
            <button className="focus:outline-none">
              {assessmentExpanded ? (
                <ArrowDropUpIcon className="text-gray-900 dark:text-gray-100" />
              ) : (
                <ArrowDropDownIcon className="text-gray-900 dark:text-gray-100" />
              )}
            </button>
          )}
        </div>
        {(isStudent ? assessmentExpanded : true) && (
          <div>
            {isAdmin ? (
              <AdminAssessmentTasks communityId={communityId} />
            ) : assessment.loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading assessment tasks...</p>
            ) : assessment.error ? (
              <p className="text-red-500 dark:text-red-400">{assessment.error}</p>
            ) : (
              <AssessmentTasks tasks={assessment.participation} />
            )}
          </div>
        )}
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />

      {/* Members Section */}
      <div className="mb-4">
        <div
          className={`flex items-center justify-between ${isStudent ? "cursor-pointer" : ""}`}
          onClick={isStudent ? () => setMembersExpanded((prev) => !prev) : undefined}
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Members
          </h2>
          {isStudent && (
            <button className="focus:outline-none">
              {membersExpanded ? (
                <ArrowDropUpIcon className="text-gray-900 dark:text-gray-100" />
              ) : (
                <ArrowDropDownIcon className="text-gray-900 dark:text-gray-100" />
              )}
            </button>
          )}
        </div>
        {(isStudent ? membersExpanded : true) && (
          <ul className="space-y-4">
            {community.members && community.members.length > 0 ? (
              community.members.map((member) => (
                <li key={member._id} className="flex items-center">
                  <UserAvatar
                    user={member}
                    handleSignOut={() => { }}
                    className="h-8 w-8 mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {member.username || member.name}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400">No members in this community yet.</li>
            )}
          </ul>
        )}
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />

      {/* Leave Button */}
      {user && (
        <button
          onClick={handleLeave}
          className="w-full border border-red-500 text-red-500 px-4 py-2 rounded-full hover:bg-red-100 transition-colors duration-200"
        >
          Leave Community
        </button>
      )}
    </div>
  );
}

export default CommunitySidebar;