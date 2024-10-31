// /frontend/src/components/KnowledgeNode/QuestionCard.js

import React from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import TextContent from "../ViewQuestion/TextContent";
import VoteButtons from "../VoteButtons/VoteButtons";
import PropTypes from "prop-types";

function QuestionCard({ question, onUpvote, onDownvote }) {
  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      {/* Question Stats */}
      <div className="flex md:flex-col items-center justify-between md:justify-start md:mr-6 mb-4 md:mb-0">
        <VoteButtons
          voteCount={question.voteCount}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
          userHasUpvoted={question.userHasUpvoted}
          userHasDownvoted={question.userHasDownvoted}
        />
      </div>

      {/* Question Details */}
      <div className="flex-1">
        <Link
          to={`/question/${question._id}`}
          className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {question.title}
        </Link>
        <TextContent
          content={question.content || question.textcontent}
          type="question"
        />
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

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    textcontent: PropTypes.string,
    voteCount: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    userHasUpvoted: PropTypes.bool.isRequired,
    userHasDownvoted: PropTypes.bool.isRequired,
    user: PropTypes.shape({
      profilePicture: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
};

export default QuestionCard;
