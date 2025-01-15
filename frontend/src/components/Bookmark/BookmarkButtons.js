// frontend/src/components/Bookmark/BookmarkButtons.js

import React from "react";
import { IconButton } from "@mui/material";
import { BookmarkBorder, Bookmark } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * BookmarkButtons - a reusable component for toggling bookmark state
 * @param {boolean} isBookmarked  - whether the item is currently bookmarked
 * @param {function} onToggleBookmark - function to call when the user clicks to toggle
 * @param {boolean} loading      - optional: if you want to disable buttons during API calls
 */
function BookmarkButtons({ isBookmarked, onToggleBookmark, loading }) {
  return (
    <div className="flex items-center space-x-2 p-1">
      <IconButton
        onClick={onToggleBookmark}
        size="small"
        color={isBookmarked ? "primary" : "default"}
        disabled={loading}
        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
      >
        {isBookmarked ? (
          <Bookmark className="text-yellow-500" />
        ) : (
          <BookmarkBorder className="text-gray-500 dark:text-gray-400 cursor-pointer" />
        )}
      </IconButton>
    </div>
  );
}

BookmarkButtons.propTypes = {
  isBookmarked: PropTypes.bool.isRequired,
  onToggleBookmark: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

BookmarkButtons.defaultProps = {
  loading: false,
};

export default BookmarkButtons;
