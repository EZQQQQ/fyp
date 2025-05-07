// frontend/src/components/KnowledgeNode/QuestionCard.js

import React from "react";
import { Link } from "react-router-dom";
import TextContent from "../ViewQuestion/TextContent";
import VoteButtons from "../VoteButtons/VoteButtons";
import BookmarkButtons from "../Bookmark/BookmarkButtons";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";
import { ChatBubbleOutline } from "@mui/icons-material";
import useVote from "../../hooks/useVote";
import useBookmark from "../../hooks/useBookmark";
import UserAvatar from "../../common/UserAvatar";
import CommunityAvatar from "../Community/CommunityAvatar";
import MediaViewer from "../MediaViewer/MediaViewer";
import PollResults from "../Polls/PollResults";
import ReportButton from '../Report/ReportButton';
import { reportItem, deleteReportedItem } from '../../services/reportService';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../features/userSlice';

// Helper function to compute relative time from createdAt date string
function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec. ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min. ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hr. ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} d ago`;
  }
}

function QuestionCard({ question, currentUser, onUserUpdate, updateQuestionVote, uploadPath = "communityPosts", onQuestionRemoved }) {
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
    files,
    contentType,
  } = question;
  // const user = useSelector(selectUser);
  const loggedInUser = useSelector(selectUser);
  const navigate = useNavigate();

  const totalResponses = (answersCount || 0) + (commentsCount || 0) + (question.answerCommentsCount || 0);

  //function to handle report
  const handleReport = async (type, itemId) => {
    await reportItem(type, itemId);
    alert("Reported successfully!");
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this question?')) {
      try {
        await deleteReportedItem(question._id, 'question');

        // Call the callback if provided to update parent component state
        if (onQuestionRemoved) {
          onQuestionRemoved(question._id);
        }

        // Always redirect to home page after deletion
        navigate('/');

        // Show success toast
        toast.success("Question deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete question: " + (error.response?.data?.message || "Unknown error"));
      }
    }
  };

  const handleVoteUpdate = (voteData) => {
    if (updateQuestionVote) {
      updateQuestionVote(_id, voteData);
    }
  };

  // Custom voting hook
  const { handleUpvote, handleDownvote, loading } = useVote(_id, true, handleVoteUpdate);

  // Custom bookmarking hook
  const { isBookmarked, handleBookmarkToggle } = useBookmark(_id, currentUser, onUserUpdate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-1 px-4 w-full border dark:border-gray-700">
      {/* Top Row: Community Info, Time Posted and User Info, and Bookmark */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-4">
          {/* Community Info */}
          {community && (
            <div className="flex items-center gap-2">
              <CommunityAvatar avatarUrl={community.avatar} name={community.name} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {community.name || "Unknown Community"}
              </span>
            </div>
          )}
          {/* Time Posted and User Info */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">{getRelativeTime(createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center">
          {/* Report/Delete Buttons (stays on the right) */}
          {loggedInUser && (loggedInUser.role === 'professor' || loggedInUser.role === 'admin') ? (
            <IconButton color="error" onClick={handleDelete}>
              <DeleteForeverIcon
                className="cursor-pointer text-gray-500 hover:text-red-600"
              />
            </IconButton>
          ) : (
            <ReportButton type="question" itemId={question._id} onReport={handleReport} />
          )}
          {/* Bookmark Buttons (stays on the right) */}
          <BookmarkButtons
            isBookmarked={isBookmarked}
            onToggleBookmark={handleBookmarkToggle}
            loading={false}
          />
        </div>
      </div>


      {/* Question Title */}
      <Link
        to={`/question/${_id}`}
        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline block break-words whitespace-normal"
      >
        {title}
      </Link>


      {/* Question Description */}
      <div className="mb-2 line-clamp-3 md:line-clamp-6 break-all whitespace-pre-wrap">
        <TextContent content={content || textcontent} type="question" />
      </div>

      {/* Files Preview */}
      {files?.length > 0 && (
        <div className="my-1">
          {files.map((fileUrl, index) => {
            const isPDF = fileUrl.toLowerCase().endsWith(".pdf");
            return (
              <div key={index}>
                <MediaViewer file={fileUrl} uploadPath={uploadPath} />
                {isPDF && (
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View PDF
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Poll Results (if applicable) */}
      {contentType === 2 && (
        <div className="my-4">
          <PollResults questionId={_id} />
        </div>
      )}

      {/* Bottom Row: Vote Buttons, Responses and User Info */}
      <div className="flex justify-between items-center my-2">
        {/* Left Side: Vote Buttons and Total Responses */}
        <div className="flex items-center space-x-4">
          <VoteButtons
            voteCount={voteCount}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            userHasUpvoted={userHasUpvoted}
            userHasDownvoted={userHasDownvoted}
            loading={loading}
          />

          <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-full p-1 h-8">
            <IconButton size="small" color="default" className="p-0">
              <Link to={`/question/${_id}`}>
                <ChatBubbleOutline
                  className="text-gray-500 dark:text-white"
                  fontSize="small"
                />
              </Link>
            </IconButton>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {totalResponses}
            </span>
          </div>
        </div>

        {/* Right Side: User Info (Avatar and Username) */}
        <div className="flex items-center space-x-2">
          <UserAvatar user={user} handleSignOut={() => { }} className="h-6 w-6" />
          <p className="text-gray-800 dark:text-gray-100">
            {user?.username || "Unknown User"}
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
      username: PropTypes.string,
    }),
    community: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }),
    answersCount: PropTypes.number,
    commentsCount: PropTypes.number,
    files: PropTypes.arrayOf(PropTypes.string),
    contentType: PropTypes.number,
  }).isRequired,
  currentUser: PropTypes.shape({
    bookmarkedQuestions: PropTypes.arrayOf(PropTypes.string),
  }),
  onUserUpdate: PropTypes.func,
  updateQuestionVote: PropTypes.func,
  uploadPath: PropTypes.string,
};

export default QuestionCard;
