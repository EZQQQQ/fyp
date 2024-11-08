// /frontend/src/components/KnowledgeNode/QuestionCard.js

import React from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import TextContent from "../ViewQuestion/TextContent";
import VoteButtons from "../VoteButtons/VoteButtons";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";
import { BookmarkBorder, ChatBubbleOutline } from "@mui/icons-material";

function QuestionCard({ question, onUpvote, onDownvote }) {
  // Calculate total responses
  console.log("Question data:", question);
  const totalResponses =
    (question.answersCount || 0) + (question.commentsCount || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      {/* Top Row: Community Info and Bookmark */}
      <div className="flex items-center justify-between mb-2">
        {/* Community Info */}
        {question.community && (
          <div className="flex items-center">
            <Avatar
              src={
                question.community.avatar ||
                "/uploads/defaults/default-avatar.jpeg"
              }
              alt={question.community.name || "Community Avatar"}
              className="h-8 w-8 mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {question.community.name || "Unknown Community"}
            </span>
          </div>
        )}
        {/* Bookmark Icon */}
        <BookmarkBorder className="text-gray-500 dark:text-gray-400 cursor-pointer" />
      </div>

      {/* Question Title */}
      <Link
        to={`/question/${question._id}`}
        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
      >
        {question.title}
      </Link>

      {/* Question Description */}
      <div className="mb-4">
        <TextContent
          content={question.content || question.textcontent}
          type="question"
          className="line-clamp-3 md:line-clamp-6"
        />
      </div>

      {/* Bottom Row: Vote Buttons, Total Responses, Time Posted, User Info */}
      <div className="flex flex-wrap justify-between items-center">
        {/* Vote Buttons */}
        <div className="flex items-center mb-2 sm:mb-0">
          <VoteButtons
            voteCount={question.voteCount}
            onUpvote={onUpvote}
            onDownvote={onDownvote}
            userHasUpvoted={question.userHasUpvoted}
            userHasDownvoted={question.userHasDownvoted}
          />
        </div>

        {/* Total Responses */}
        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 space-x-1">
          <IconButton size="small" color="default" className="p-0">
            <ChatBubbleOutline fontSize="small" />
          </IconButton>
          <span className="text-sm font-medium">{totalResponses}</span>
        </div>

        {/* Time Posted and User Info */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-2">
            {new Date(question.createdAt).toLocaleString()}
          </span>
          <Avatar
            src={
              question.user?.profilePicture ||
              "/uploads/defaults/default-avatar-user.jpeg"
            }
            alt={question.user?.name || "User Avatar"}
            className="h-6 w-6 mr-2"
          />
          <p className="text-gray-800 dark:text-gray-100">
            {question.user?.name || "Unknown User"}
          </p>
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
    community: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }),
    answersCount: PropTypes.number,
    commentsCount: PropTypes.number,
  }).isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
};

export default QuestionCard;
