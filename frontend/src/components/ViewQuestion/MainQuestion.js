// /frontend/src/components/ViewQuestion/MainQuestion.js

import React, { useState, useEffect } from "react";
import { Bookmark, History } from "@mui/icons-material";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { Link, useParams } from "react-router-dom";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import axiosInstance from "../../utils/axiosConfig";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { setVoteData, selectVoteData } from "../../features/voteSlice";
import TextContent from "./TextContent";
import VoteButtons from "../VoteButtons/VoteButtons";
import handleVote from "../../services/votingService";
import useVote from "../../hooks/useVote";
import { toast } from "react-toastify"; // Toastify
import "react-toastify/dist/ReactToastify.css"; // Toastify CSS
import UserAvatar from "../../common/UserAvatar";

function MainQuestion() {
  const { questionId } = useParams();
  const user = useSelector(selectUser);
  const voteData = useSelector(selectVoteData);
  const dispatch = useDispatch();

  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [answerLoading, setAnswerLoading] = useState({}); // For managing loading states per answer

  // Fetch Question Data on Mount
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axiosInstance.get(`/question/${questionId}`);
        setQuestion(response.data.data);
        setComments(response.data.data.comments || []);
        setAnswers(response.data.data.answers || []);
        // Initialize vote data in Redux
        dispatch(
          setVoteData({
            targetId: questionId,
            voteInfo: {
              voteCount: response.data.data.voteCount,
              userHasUpvoted: response.data.data.userHasUpvoted,
              userHasDownvoted: response.data.data.userHasDownvoted,
            },
          })
        );
      } catch (error) {
        console.error("Error fetching question:", error.response?.data);
        toast.error(
          error.response?.data?.message || "Failed to fetch the question."
        );
      }
    };
    fetchQuestion();
  }, [questionId, dispatch]);

  // Update local question state when vote data changes
  useEffect(() => {
    if (voteData[questionId]) {
      setQuestion((prev) => ({
        ...prev,
        voteCount: voteData[questionId].voteCount,
        userHasUpvoted: voteData[questionId].userHasUpvoted,
        userHasDownvoted: voteData[questionId].userHasDownvoted,
      }));
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
            userHasUpvoted: voteInfo.userHasUpvoted,
            userHasDownvoted: voteInfo.userHasDownvoted,
          };
        }
        return ans;
      })
    );
  }, [voteData]);

  // Handle voting for the main question using useVote hook
  const {
    handleUpvote: handleQuestionUpvote,
    handleDownvote: handleQuestionDownvote,
    loading: questionLoading,
  } = useVote(questionId, true, (voteData) => {
    setQuestion((prev) => ({
      ...prev,
      voteCount: voteData.voteCount,
      userHasUpvoted: voteData.userHasUpvoted,
      userHasDownvoted: voteData.userHasDownvoted,
    }));
  });

  // Handle voting for answers using existing functions with loading state
  const handleAnswerVote = async (type, answerId) => {
    // Prevent voting if already loading
    if (answerLoading[answerId]) return;

    // Set loading state for this answer
    setAnswerLoading((prev) => ({ ...prev, [answerId]: true }));

    try {
      const voteResult = await handleVote(type, answerId, false);
      setAnswers((prevAnswers) =>
        prevAnswers.map((ans) =>
          ans._id === answerId
            ? {
                ...ans,
                voteCount: voteResult.voteCount,
                userHasUpvoted: voteResult.userHasUpvoted,
                userHasDownvoted: voteResult.userHasDownvoted,
              }
            : ans
        )
      );
      // Update Redux store
      dispatch(
        setVoteData({
          targetId: answerId,
          voteInfo: {
            voteCount: voteResult.voteCount,
            userHasUpvoted: voteResult.userHasUpvoted,
            userHasDownvoted: voteResult.userHasDownvoted,
          },
        })
      );
      // Show toast only if it's a new vote, not a retraction
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
      // Remove loading state for this answer
      setAnswerLoading((prev) => ({ ...prev, [answerId]: false }));
    }
  };

  const handleToggleCommentBox = () => {
    setShowCommentBox(!showCommentBox);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (commentText.trim() === "") return;
    try {
      const response = await axiosInstance.post(`/comment/${questionId}`, {
        comment: commentText,
      });
      setComments([...comments, response.data.data]);
      setCommentText("");
      setShowCommentBox(false);
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

      // Add default voting fields
      const answerWithDefaults = {
        ...newAnswer,
        userHasUpvoted: false,
        userHasDownvoted: false,
      };

      setAnswers((prevAnswers) => [...prevAnswers, answerWithDefaults]);

      setAnswerText("");
      toast.success("Answer posted successfully!");
    } catch (error) {
      console.error("Error adding answer:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to post answer.");
    }
  };

  if (!question) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-4 sm:mb-0 text-gray-900 dark:text-gray-100 break-words">
            {question.title}
          </h2>
        </div>

        {/* Question Info */}
        <div className="mb-6">
          <div className="flex flex-wrap text-sm text-gray-500 dark:text-gray-400">
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
        <div className="mb-8">
          {/* Content */}
          <div className="mb-4">
            <TextContent content={question.content} type="question" />
          </div>

          {/* Files */}
          {question.files?.length > 0 && (
            <div className="my-4 flex flex-wrap gap-4">
              {question.files.map((fileUrl, index) => (
                <img
                  key={index}
                  src={fileUrl}
                  alt={`Attachment ${index + 1}`}
                  className="max-w-xs sm:max-w-sm md:max-w-md rounded-md object-contain"
                />
              ))}
            </div>
          )}

          {/* Poll Options */}
          {question.pollOptions?.length > 0 && (
            <div className="my-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Poll Options:
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {question.pollOptions.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Author Info and Voting Buttons */}
          <div className="flex items-center justify-between mt-6">
            {/* Voting Buttons */}
            <VoteButtons
              voteCount={question.voteCount}
              onUpvote={handleQuestionUpvote}
              onDownvote={handleQuestionDownvote}
              userHasUpvoted={question.userHasUpvoted}
              userHasDownvoted={question.userHasDownvoted}
              loading={questionLoading} // Pass loading prop
            />

            {/* Author Info */}
            <div className="flex items-center space-x-2">
              {/* Use UserAvatar Component */}
              <UserAvatar
                user={question.user}
                handleSignOut={() => {}}
                className=""
              />
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {question.user?.username || question.user?.name || "Anonymous"}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(question.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6">
            <h3 className="text-sm text-gray-700 dark:text-gray-400 mb-2">
              Comments
            </h3>
            {comments.map((comment) => (
              <div
                className="mb-4 pl-4 border-l border-gray-300 dark:border-gray-600"
                key={comment._id} // Ensure unique key
              >
                <p className="text-gray-700 dark:text-gray-300 text-sm break-words">
                  {comment.comment} -{" "}
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-sm font-medium">
                    {comment.user?.username || comment.user?.name || "Anonymous"}
                  </span>{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </p>
              </div>
            ))}
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={handleToggleCommentBox}
            >
              Add a comment
            </button>
            {showCommentBox && (
              <div className="mt-4 pl-4 border-l border-gray-300 dark:border-gray-600">
                <textarea
                  placeholder="Add your comment..."
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                ></textarea>
                <button
                  onClick={handleCommentSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
                >
                  Add Comment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          </h3>
          {answers.map((answer) => (
            <div
              className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm flex flex-col"
              key={answer._id}
            >
              {/* Content */}
              <div className="mb-4">
                <TextContent content={answer.answer} type="answer" />
              </div>

              {/* Voting and Author Info */}
              <div className="flex items-center justify-between">
                {/* Voting Buttons */}
                <VoteButtons
                  voteCount={answer.voteCount}
                  onUpvote={() => handleAnswerVote("upvote", answer._id)}
                  onDownvote={() => handleAnswerVote("downvote", answer._id)}
                  userHasUpvoted={answer.userHasUpvoted}
                  userHasDownvoted={answer.userHasDownvoted}
                  loading={answerLoading[answer._id] || false}
                />

                {/* Author Info */}
                <div className="flex items-center space-x-2">
                  {/* Use UserAvatar Component */}
                  <UserAvatar user={answer.user} handleSignOut={() => {}} />
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {answer.user?.username || answer.user?.name || "Anonymous"}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(answer.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Form */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm">
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Post Your Answer
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainQuestion;
