// frontend/src/components/ViewQuestion/CommentSection.js

import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function CommentSection({
  comments,
  onAddComment,
  loading,
  parentId,
  commentType,
}) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

  const handleToggleCommentBox = () => {
    setShowCommentBox(!showCommentBox);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (commentText.trim() === "") return;
    await onAddComment(parentId, commentText);
    setCommentText("");
    setShowCommentBox(false);
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div
          className="flex items-center cursor-pointer"
          onClick={handleToggleCollapse}
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400">
            Comments
          </h3>
          {isCollapsed ? (
            <ExpandMoreIcon className="text-gray-700 dark:text-gray-400 ml-2" />
          ) : (
            <ExpandLessIcon className="text-gray-700 dark:text-gray-400 ml-2" />
          )}
        </div>
        <button
          className="text-sm text-blue-500 hover:underline"
          onClick={handleToggleCommentBox}
        >
          Add a comment
        </button>
      </div>

      {!isCollapsed && (
        <>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
          ) : (
            comments.slice(0, visibleCommentsCount).map((comment) => (
              <div
                className="mb-2 pl-4 border-l border-gray-300 dark:border-gray-600"
                key={comment._id}
              >
                <p className="text-gray-700 dark:text-gray-300 text-sm custom-break">
                  {comment.comment} -{" "}
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-sm font-small">
                    {comment.user?.username || comment.user?.name || "Anonymous"}
                  </span>{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </p>
              </div>
            ))
          )}
          {comments.length > visibleCommentsCount && (
            <button
              onClick={() => setVisibleCommentsCount((prev) => prev + 3)}
              className="text-sm text-blue-500 hover:underline pl-4 border-l border-gray-300 dark:border-gray-600"
            >
              Show More
            </button>
          )}
          {showCommentBox && (
            <div className="mt-4 pl-4 border-l border-gray-300 dark:border-gray-600">
              <textarea
                placeholder="Add your comment..."
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              />
              <button
                onClick={handleCommentSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
              >
                Add Comment
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CommentSection;
