// frontend/src/components/Bookmark/BookmarkButtons.js

import React from "react";
import PropTypes from "prop-types";
import "./BookmarkButtons.css";

/**
 * BookmarkButtons - a reusable component for toggling bookmark state
 * @param {boolean} isBookmarked  - whether the item is currently bookmarked
 * @param {function} onToggleBookmark - function to call when the user clicks to toggle
 * @param {boolean} loading      - optional: if you want to disable buttons during API calls
 */
function BookmarkButtons({ isBookmarked, onToggleBookmark, loading }) {
  return (
    <label className="ui-bookmark">
      <input
        type="checkbox"
        checked={isBookmarked}
        onChange={onToggleBookmark}
        disabled={loading}
      />
      <div className="bookmark">
        <svg viewBox="0 0 32 32">
          <g>
            <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"></path>
          </g>
        </svg>
      </div>
    </label>
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
