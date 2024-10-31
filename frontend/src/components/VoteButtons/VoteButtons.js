// /frontend/src/components/VoteButtons/VoteButtons.js

import React from "react";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import PropTypes from "prop-types";

function VoteButtons({
  voteCount,
  onUpvote,
  onDownvote,
  userHasUpvoted,
  userHasDownvoted,
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onUpvote}
        className={`p-1 ${
          userHasUpvoted
            ? "text-blue-400 cursor-pointer"
            : "text-gray-500 hover:text-blue-300"
        }`}
        title={
          userHasUpvoted ? "Click to remove your upvote" : "Click to upvote"
        }
      >
        <ArrowUpward />
      </button>
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 my-1">
        {voteCount || 0}
      </p>
      <button
        onClick={onDownvote}
        className={`p-1 ${
          userHasDownvoted
            ? "text-red-400 cursor-pointer"
            : "text-gray-500 hover:text-red-300"
        }`}
        title={
          userHasDownvoted
            ? "Click to remove your downvote"
            : "Click to downvote"
        }
      >
        <ArrowDownward />
      </button>
    </div>
  );
}

VoteButtons.propTypes = {
  voteCount: PropTypes.number.isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
  userHasUpvoted: PropTypes.bool.isRequired,
  userHasDownvoted: PropTypes.bool.isRequired,
};

export default VoteButtons;
