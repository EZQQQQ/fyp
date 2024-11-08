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
}) {
  return (
    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 space-x-1">
      <IconButton
        onClick={onUpvote}
        size="small"
        color={userHasUpvoted ? "primary" : "default"}
        className="p-0"
        title={userHasUpvoted ? "Remove upvote" : "Upvote"}
      >
        <ArrowUpward fontSize="small" />
      </IconButton>
      <span className="text-sm font-medium">{voteCount || 0}</span>
      <IconButton
        onClick={onDownvote}
        size="small"
        color={userHasDownvoted ? "secondary" : "default"}
        className="p-0"
        title={userHasDownvoted ? "Remove downvote" : "Downvote"}
      >
        <ArrowDownward fontSize="small" />
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
};

export default VoteButtons;
