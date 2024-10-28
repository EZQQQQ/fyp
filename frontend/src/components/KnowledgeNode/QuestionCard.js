// /frontend/src/components/KnowledgeNode/QuestionCard.js

import React from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";

function QuestionCard({ question }) {
  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      {/* Question Stats */}
      <div className="flex md:flex-col items-center justify-between md:justify-start md:mr-6 mb-4 md:mb-0">
        <div className="flex flex-col items-center mr-4 md:mr-0">
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {question.votes || 0}
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Votes
          </span>
        </div>
        <div className="flex flex-col items-center mr-4 md:mr-0">
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {question.answers?.length || 0}
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Answers
          </span>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {question.views || 0}
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Views
          </span>
        </div>
      </div>

      {/* Question Details */}
      <div className="flex-1">
        <Link
          to={`/question/${question._id}`}
          className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {question.title}
        </Link>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          {question.content}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(question.createdAt).toLocaleString()}
          </span>
          <div className="flex items-center">
            <Avatar
              src={question.user?.profilePicture}
              alt={question.user?.name || "User Avatar"}
              className="h-6 w-6 mr-2"
            />
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {question.user?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;
