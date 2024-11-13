// /frontend/src/components/VoteButtons/VoteButtons.js

import React from "react";
import { IconButton } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import PropTypes from "prop-types";

function VoteButtons({
  voteCount,
  onUpvote,
  onDownvote,
  userHasUpvoted,
  userHasDownvoted,
  loading,
}) {
  return (
    <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-full p-2">
      {/* Upvote Button */}
      <IconButton
        onClick={onUpvote}
        size="small"
        color={userHasUpvoted ? "primary" : "default"}
        className="p-0"
        title={userHasUpvoted ? "Remove upvote" : "Upvote"}
        disabled={loading}
        aria-label={userHasUpvoted ? "Remove upvote" : "Upvote"}
      >
        <ArrowUpward
          className={`${
            userHasUpvoted
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-800 dark:text-white"
          }`}
          fontSize="small"
        />
      </IconButton>

      {/* Vote Count */}
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {voteCount}
      </span>

      {/* Downvote Button */}
      <IconButton
        onClick={onDownvote}
        size="small"
        color={userHasDownvoted ? "secondary" : "default"}
        className="p-0"
        title={userHasDownvoted ? "Remove downvote" : "Downvote"}
        disabled={loading}
        aria-label={userHasDownvoted ? "Remove downvote" : "Downvote"}
      >
        <ArrowDownward
          className={`${
            userHasDownvoted
              ? "text-red-500 dark:text-red-400"
              : "text-gray-800 dark:text-white"
          }`}
          fontSize="small"
        />
      </IconButton>
    </div>
  );
}

VoteButtons.propTypes = {
  voteCount: PropTypes.number.isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
  userHasUpvoted: PropTypes.bool.isRequired,
  userHasDownvoted: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default VoteButtons;
