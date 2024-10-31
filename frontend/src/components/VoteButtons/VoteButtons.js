// /frontend/src/components/VoteButtons/VoteButtons.js

import React from "react";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import PropTypes from "prop-types";

function VoteButtons({ voteCount, onUpvote, onDownvote }) {
  return (
    <div className="flex flex-col items-center">
      <ArrowUpward
        className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
        onClick={onUpvote}
      />
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {voteCount || 0}
      </p>
      <ArrowDownward
        className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
        onClick={onDownvote}
      />
    </div>
  );
}

VoteButtons.propTypes = {
  voteCount: PropTypes.number.isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
};

export default VoteButtons;
