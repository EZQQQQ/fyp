// frontend/src/components/ViewQuestion/MainQuestion.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import axiosInstance from "../../utils/axiosConfig";
import { useSelector, useDispatch } from "react-redux";
import { setVoteData, selectVoteData } from "../../features/voteSlice";
import TextContent from "./TextContent";
import VoteButtons from "../VoteButtons/VoteButtons";
import BookmarkButtons from "../Bookmark/BookmarkButtons";
import handleVote from "../../services/votingService";
import useVote from "../../hooks/useVote";
import useBookmark from "../../hooks/useBookmark";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserAvatar from "../../common/UserAvatar";
import MediaViewer from "../MediaViewer/MediaViewer";
import PollResults from "../Polls/PollResults";
import CommentSection from "./CommentSection";
import { selectUser } from "../../features/userSlice";
import CommunityAvatar from "../Community/CommunityAvatar";
import FilterDropdown from "../KnowledgeNode/FilterDropdown";
import ReportButton from '../Report/ReportButton';
import { reportItem, deleteReportedItem } from '../../services/reportService';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ReportIcon from '@mui/icons-material/Report';
import { useNavigate } from 'react-router-dom';

// Helper function to format time difference in a "time ago" format
function formatTimeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) {
    return `${minutes} min. ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr. ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function MainQuestion() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const voteData = useSelector(selectVoteData);
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [answerLoading, setAnswerLoading] = useState({});
  const [answerComments, setAnswerComments] = useState({});
  const [loadingAnswerComments, setLoadingAnswerComments] = useState(false);

  // State for answer filter
  const [answerFilter, setAnswerFilter] = useState("newest");
  const answerFilterOptions = [
    { label: "Newest", value: "newest" },
    { label: "Popular", value: "popular" },
  ];

  // Fetch Question Data on Mount
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axiosInstance.get(`/question/${questionId}`);
        const qData = response.data.data;
        setQuestion(qData);
        setComments(qData.comments || []);
        setAnswers(qData.answers || []);
        dispatch(
          setVoteData({
            targetId: questionId,
            voteInfo: {
              voteCount: qData.voteCount,
              userHasUpvoted: qData.userHasUpvoted,
              userHasDownvoted: qData.userHasDownvoted,
            },
          })
        );

        // Fetch comments for each answer
        const fetchAllAnswerComments = async () => {
          setLoadingAnswerComments(true);
          try {
            const commentsPromises = qData.answers.map((ans) =>
              axiosInstance.get(`/comment/answer/${ans._id}`)
            );
            const commentsResponses = await Promise.all(commentsPromises);
            const initialAnswerComments = {};
            commentsResponses.forEach((res, index) => {
              initialAnswerComments[qData.answers[index]._id] =
                res.data.data || [];
            });
            setAnswerComments(initialAnswerComments);
          } catch (error) {
            console.error("Error fetching answer comments:", error.response?.data);
            toast.error(
              error.response?.data?.message || "Failed to fetch answer comments."
            );
          } finally {
            setLoadingAnswerComments(false);
          }
        };

        await fetchAllAnswerComments();
      } catch (error) {
        console.error("Error fetching question:", error.response?.data);
        toast.error(
          error.response?.data?.message || "Failed to fetch the question."
        );
      }
    };
    fetchQuestion();
  }, [questionId, dispatch]);

  const handleReport = async (type, itemId) => {
    try {
      await reportItem(type, itemId);
      toast.success("Reported successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to report item.");
    }
  };

  const handleDelete = async (type, itemId) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} permanently?`)) {
      return;
    }

    try {
      await deleteReportedItem(itemId, type);

      if (type === "question") {
        toast.success("Question deleted successfully.");
        navigate("/"); // This already exists in your code
      } else if (type === "answer") {
        toast.success("Answer deleted successfully.");
        setAnswers(answers.filter(answer => answer._id !== itemId));
      } else if (type === "comment") {
        toast.success("Comment deleted successfully.");
        // Refresh comments after deletion
        if (comments.some(comment => comment._id === itemId)) {
          setComments(comments.filter(comment => comment._id !== itemId));
        } else {
          // It's an answer comment - update the state
          const updatedAnswerComments = { ...answerComments };
          Object.keys(updatedAnswerComments).forEach(answerId => {
            updatedAnswerComments[answerId] = updatedAnswerComments[answerId].filter(
              comment => comment._id !== itemId
            );
          });
          setAnswerComments(updatedAnswerComments);
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || `Failed to delete ${type}.`);
    }
  };

  // Update local question state when vote data changes
  useEffect(() => {
    if (voteData[questionId]) {
      setQuestion((prev) => {
        // Only update vote info if the previous state is complete (has an _id)
        if (!prev || !prev._id) {
          return prev;
        }

        const updatedQuestion = {
          ...prev,
          voteCount: voteData[questionId].voteCount,
          userHasUpvoted: voteData[questionId].userHasUpvoted,
          userHasDownvoted: voteData[questionId].userHasDownvoted,
        };

        return updatedQuestion;
      });
    }
  }, [voteData, questionId]);

  // Sync answer vote data from Redux to local state
  useEffect(() => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((ans) => {
        if (voteData[ans._id]) {
          const voteInfo = voteData[ans._id];
          return {
            ...ans,
            voteCount: voteInfo.voteCount,
            userHasUpvoted: voteInfo.voteCount ? voteInfo.userHasUpvoted : false,
            userHasDownvoted: voteInfo.voteCount ? voteInfo.userHasDownvoted : false,
          };
        }
        return ans;
      })
    );
  }, [voteData]);

  const {
    handleUpvote: handleQuestionUpvote,
    handleDownvote: handleQuestionDownvote,
    loading: questionLoading,
  } = useVote(questionId, true, (voteData) => {
    setQuestion((prev) => ({
      ...prev,
      voteCount: voteData.voteCount,
      userHasUpvoted: voteData.voteHasUpvoted,
      userHasDownvoted: voteData.userHasDownvoted,
    }));
  });

  const { isBookmarked, handleBookmarkToggle } = useBookmark(questionId, currentUser);

  const handleAnswerVote = async (type, answerId) => {
    if (answerLoading[answerId]) return;
    setAnswerLoading((prev) => ({ ...prev, [answerId]: true }));
    try {
      const voteResult = await handleVote(type, answerId, false);
      setAnswers((prevAnswers) =>
        prevAnswers.map((ans) =>
          ans._id === answerId
            ? {
              ...ans,
              voteCount: voteResult.voteCount,
              userHasUpvoted: type === "upvote" ? true : false,
              userHasDownvoted: type === "downvote" ? true : false,
            }
            : ans
        )
      );
      dispatch(
        setVoteData({
          targetId: answerId,
          voteInfo: {
            voteCount: voteResult.voteCount,
            userHasUpvoted: type === "upvote" ? true : false,
            userHasDownvoted: type === "downvote" ? true : false,
          },
        })
      );
      if (voteResult.action === "voted") {
        toast.success(
          type === "upvote"
            ? "Answer upvoted successfully!"
            : "Answer downvoted successfully!"
        );
      } else if (voteResult.action === "removed") {
        toast.info(
          type === "upvote"
            ? "Upvote removed from answer."
            : "Downvote removed from answer."
        );
      }
    } catch (error) {
      console.error("Voting Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to vote.");
    } finally {
      setAnswerLoading((prev) => ({ ...prev, [answerId]: false }));
    }
  };

  const handleAddQuestionComment = async (parentId, comment) => {
    try {
      const response = await axiosInstance.post(`/comment/question/${parentId}`, {
        comment,
      });
      setComments([...comments, response.data.data]);
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleAddAnswerComment = async (answerId, comment) => {
    try {
      const response = await axiosInstance.post(`/comment/answer/${answerId}`, {
        comment,
      });
      setAnswerComments((prev) => ({
        ...prev,
        [answerId]: [...prev[answerId], response.data.data],
      }));
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (answerText.trim() === "") return;
    try {
      const response = await axiosInstance.post(`/answer/${questionId}`, {
        answer: answerText,
      });
      const newAnswer = response.data.data;
      const answerWithDefaults = {
        ...newAnswer,
        userHasUpvoted: false,
        userHasDownvoted: false,
        comments: [],
      };
      setAnswers((prevAnswers) => [...prevAnswers, answerWithDefaults]);
      setAnswerComments((prev) => ({
        ...prev,
        [newAnswer._id]: [],
      }));
      setAnswerText("");
      toast.success("Answer posted successfully!");
    } catch (error) {
      console.error("Error adding answer:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to post answer.");
    }
  };

  // Only render content if question data is loaded
  if (!question) {
    return (
      <div className="flex justify-center items-center h-screen overflow-x-hidden">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  // Sort answers based on answerFilter
  const sortedAnswers = [...answers].sort((a, b) => {
    if (answerFilter === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (answerFilter === "popular") {
      return b.voteCount - a.voteCount;
    }
    return 0;
  });

  return (
    <div className="w-full sm:max-w-4xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-md shadow-md overflow-x-hidden">
      {/* Header: Community Info and Bookmark on the same row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CommunityAvatar
            avatarUrl={question.community?.avatar}
            name={question.community?.name}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {question.community?.name || "Unknown Community"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.role === 'student' ? (
            <ReportButton
              type="question"
              itemId={questionId}
              onReport={handleReport}
            />
          ) : (
            <DeleteForeverIcon
              onClick={() => handleDelete("question", questionId)}
              className="cursor-pointer text-gray-500 hover:text-red-600"
            />
          )}
          <BookmarkButtons
            isBookmarked={isBookmarked}
            onToggleBookmark={handleBookmarkToggle}
            loading={false}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 break-words">
        {question.title}
      </h2>

      {/* Question Info */}
      <div className="mb-4">
        <div className="flex flex-wrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p className="mr-4">
            Asked:{" "}
            <span className="text-gray-700 dark:text-gray-300">
              {new Date(question.createdAt).toLocaleString()}
            </span>
          </p>
          <p className="mr-4">
            Active:{" "}
            <span className="text-gray-700 dark:text-gray-300">
              {new Date(question.updatedAt).toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      {/* Question Section */}
      <div className="mb-3">
        <div className="mb-3 w-full custom-break whitespace-normal">
          <TextContent content={question.content} type="question" />
        </div>
        {question.files?.length > 0 && (
          <div className="my-4">
            {question.files.map((fileUrl, index) => (
              <MediaViewer key={index} file={fileUrl} />
            ))}
          </div>
        )}
        {question.contentType === 2 && <PollResults questionId={questionId} />}
        {/* Combined vote buttons and user avatar/name in a single row,
            user info flushed right and date removed */}
        <div className="flex items-center mt-4 justify-between">
          <div className="w-fit">
            <VoteButtons
              voteCount={question.voteCount}
              onUpvote={handleQuestionUpvote}
              onDownvote={handleQuestionDownvote}
              userHasUpvoted={question.userHasUpvoted}
              userHasDownvoted={question.userHasDownvoted}
              loading={questionLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <UserAvatar user={question.user} handleSignOut={() => { }} />
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {question.user?.username || question.user?.name || "Anonymous"}
            </p>
          </div>
        </div>
        <CommentSection
          comments={comments}
          onAddComment={handleAddQuestionComment}
          loading={false}
          parentId={questionId}
          commentType="question"
          onReport={handleReport}
          onDelete={handleDelete}
        />
      </div>

      <hr className="border-t border-gray-300 dark:border-gray-700 mb-4" />

      {/* Answer Form */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm mb-4">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Your Answer
        </h3>
        <div className="mb-4">
          <MarkdownEditor
            value={answerText}
            onChange={setAnswerText}
            placeholder="Write your answer here..."
          />
        </div>
        <button
          onClick={handleAnswerSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          Post Your Answer
        </button>
      </div>

      {/* Answers Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {sortedAnswers.length} {sortedAnswers.length === 1 ? "Answer" : "Answers"}
        </h3>
        <FilterDropdown
          options={answerFilterOptions}
          selected={answerFilterOptions.find(opt => opt.value === answerFilter)}
          onSelect={(option) => setAnswerFilter(option.value)}
          buttonClassName="text-xs sm:text-sm px-2 py-1"
          optionClassName="text-xs sm:text-sm px-4 py-2"
        />
      </div>

      {/* Answers List */}
      <div className="mb-4">
        {sortedAnswers.length > 0 ? (
          <div className="flex flex-col space-y-6">
            {sortedAnswers.map((answer, index) => (
              <div key={answer._id}>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-md shadow-sm flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserAvatar user={answer.user} handleSignOut={() => { }} />
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {answer.user?.username || answer.user?.name || "Anonymous"}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(answer.createdAt)}
                      </span>
                    </div>
                    <div>
                      {currentUser.role === 'student' ? (
                        <ReportButton
                          type="answer"
                          itemId={answer._id}
                          onReport={handleReport}
                        />
                      ) : (
                        <DeleteForeverIcon
                          onClick={() => handleDelete("answer", answer._id)}
                          className="cursor-pointer text-gray-500 hover:text-red-600"
                        />
                      )}
                    </div>
                  </div>
                  <div className="my-3 custom-break whitespace-normal">
                    <TextContent content={answer.answer} type="answer" />
                  </div>
                  {answer.files?.length > 0 && (
                    <div className="my-4">
                      {answer.files.map((fileUrl, idx) => (
                        <MediaViewer key={idx} file={fileUrl} />
                      ))}
                    </div>
                  )}
                  <div className="flex">
                    <VoteButtons
                      voteCount={answer.voteCount}
                      onUpvote={() => handleAnswerVote("upvote", answer._id)}
                      onDownvote={() => handleAnswerVote("downvote", answer._id)}
                      userHasUpvoted={answer.userHasUpvoted}
                      userHasDownvoted={answer.userHasDownvoted}
                      loading={answerLoading[answer._id] || false}
                    />
                  </div>
                  <CommentSection
                    comments={answerComments[answer._id] || []}
                    onAddComment={handleAddAnswerComment}
                    loading={loadingAnswerComments}
                    parentId={answer._id}
                    commentType="answer"
                    onReport={handleReport}
                    onDelete={handleDelete}
                  />
                </div>
                {index !== sortedAnswers.length - 1 && (
                  <hr className="border-t border-gray-300 dark:border-gray-700 mb-4" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No answers available.
          </p>
        )}
      </div>
    </div>
  );
}

export default MainQuestion;