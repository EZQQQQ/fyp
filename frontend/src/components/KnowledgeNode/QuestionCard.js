// /frontend/src/components/KnowledgeNode/QuestionCard.js

import React from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import TextContent from "../ViewQuestion/TextContent";
import VoteButtons from "../VoteButtons/VoteButtons";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";
import { BookmarkBorder, ChatBubbleOutline } from "@mui/icons-material";
import useVote from "../../hooks/useVote"; // Import the custom hook

function QuestionCard({ question, updateQuestionVote }) {
  // Destructure the necessary fields from question
  const {
    _id,
    title,
    content,
    textcontent,
    voteCount,
    userHasUpvoted,
    userHasDownvoted,
    createdAt,
    user,
    community,
    answersCount,
    commentsCount,
  } = question;

  // Calculate total responses
  const totalResponses = (answersCount || 0) + (commentsCount || 0);

  // Define a function to update local state based on voting
  // This function will be passed to the custom hook
  const handleVoteUpdate = (voteData) => {
    if (updateQuestionVote) {
      updateQuestionVote(_id, voteData);
    }
  };

  // Use the custom hook
  const { handleUpvote, handleDownvote, loading } = useVote(
    _id,
    true,
    handleVoteUpdate
  ); // Assuming it's a question

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      {/* Top Row: Community Info and Bookmark */}
      <div className="flex items-center justify-between mb-2">
        {/* Community Info */}
        {community && (
          <div className="flex items-center">
            <Avatar
              src={community.avatar || "/uploads/defaults/default-avatar.jpeg"}
              alt={community.name || "Community Avatar"}
              className="h-8 w-8 mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {community.name || "Unknown Community"}
            </span>
          </div>
        )}
        {/* Bookmark Icon */}
        <BookmarkBorder className="text-gray-500 dark:text-gray-400 cursor-pointer" />
      </div>

      {/* Question Title */}
      <Link
        to={`/question/${_id}`}
        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
      >
        {title}
      </Link>

      {/* Question Description */}
      <div className="mb-4">
        <TextContent
          content={content || textcontent}
          type="question"
          className="line-clamp-3 md:line-clamp-6"
        />
      </div>

      {/* Bottom Row: Vote Buttons + Total Responses | Time Posted and User Info */}
      <div className="flex justify-between items-center">
        {/* Left Side: Vote Buttons and Total Responses */}
        <div className="flex items-center space-x-4">
          {/* Vote Buttons */}
          <VoteButtons
            voteCount={voteCount}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            userHasUpvoted={userHasUpvoted}
            userHasDownvoted={userHasDownvoted}
            loading={loading} // Pass loading prop
          />

          {/* Total Responses with Rounded Border */}
          <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-full p-2">
            <IconButton size="small" color="default" className="p-0">
              <ChatBubbleOutline
                className="text-gray-500 dark:text-white"
                fontSize="small"
              />
            </IconButton>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {totalResponses}
            </span>
          </div>
        </div>

        {/* Right Side: Time Posted and User Info */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-2">{new Date(createdAt).toLocaleString()}</span>
          <Avatar
            src={
              user?.profilePicture ||
              "/uploads/defaults/default-avatar-user.jpeg"
            }
            alt={user?.name || "User Avatar"}
            className="h-6 w-6 mr-2"
          />
          <p className="text-gray-800 dark:text-gray-100">
            {user?.name || "Unknown User"}
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
  updateQuestionVote: PropTypes.func, // New prop for updating parent state
};

export default QuestionCard;
