// /frontend/src/components/ViewQuestion/MainQuestion.js

import React, { useState, useEffect } from "react";
import { Bookmark, History } from "@mui/icons-material";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { Avatar } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import axiosInstance from "../../utils/axiosConfig";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { setVoteData, selectVoteData } from "../../features/voteSlice";
import TextContent from "./TextContent";
import VoteButtons from "../VoteButtons/VoteButtons";
import handleVote from "../../services/votingService"; // Voting service
import { toast } from "react-toastify"; // Toastify
import "react-toastify/dist/ReactToastify.css"; // Toastify CSS

function MainQuestion() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const user = useSelector(selectUser);
  const voteData = useSelector(selectVoteData);
  const dispatch = useDispatch();

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

  // Update local state when vote data changes
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

  // Handle voting for the question
  const handleQuestionVote = async (type) => {
    try {
      const voteResult = await handleVote(type, questionId, true);
      setQuestion((prev) => ({
        ...prev,
        voteCount: voteResult.voteCount,
        userHasUpvoted: voteResult.userHasUpvoted,
        userHasDownvoted: voteResult.userHasDownvoted,
      }));
      // Update Redux store
      dispatch(
        setVoteData({
          targetId: questionId,
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
            ? "Question upvoted successfully!"
            : "Question downvoted successfully!"
        );
      }
    } catch (error) {
      console.error("Voting Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to vote.");
    }
  };

  // Handle voting for answers
  const handleAnswerVote = async (type, answerId) => {
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
      }
    } catch (error) {
      console.error("Voting Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to vote.");
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
      setAnswers([...answers, response.data.data]);
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
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      {/* ToastContainer should be included once in App.js */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-4 sm:mb-0 text-gray-900 dark:text-gray-100">
            {question.title}
          </h2>
          <Link to="/add-question">
            <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              <QuestionAnswerIcon className="mr-2" />
              Ask Question
            </button>
          </Link>
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
            <p>
              Viewed:{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {question.views || 0} times
              </span>
            </p>
          </div>
        </div>

        {/* Question Section */}
        <div className="mb-8">
          <div className="flex">
            {/* Voting */}
            <div className="flex flex-col items-center mr-6">
              <VoteButtons
                voteCount={question.voteCount}
                onUpvote={() => handleQuestionVote("upvote")}
                onDownvote={() => handleQuestionVote("downvote")}
                userHasUpvoted={question.userHasUpvoted}
                userHasDownvoted={question.userHasDownvoted}
              />
            </div>
            {/* Content */}
            <div className="flex-1">
              <TextContent content={question.content} type="question" />

              {/* Files */}
              {question.files?.length > 0 && (
                <div className="my-4">
                  {question.files.map((fileUrl, index) => (
                    <img
                      key={index}
                      src={fileUrl}
                      alt={`Attachment ${index + 1}`}
                      className="max-w-full rounded-md"
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
                  <ul className="list-disc list-inside text-gray-800 dark:text-gray-200">
                    {question.pollOptions.map((option, index) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center justify-end mt-6">
                <small className="text-gray-500 dark:text-gray-400 mr-2">
                  asked {new Date(question.createdAt).toLocaleString()}
                </small>
                <div className="flex items-center">
                  <Avatar src={question.user?.profilePicture} />
                  <p className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {question.user?.name}
                  </p>
                </div>
              </div>

              {/* Comments */}
              <div className="mt-6">
                {comments.map((comment) => (
                  <div className="mb-2" key={comment._id}>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.comment} -{" "}
                      <span className="font-medium">{comment.user.name}</span>{" "}
                      <small className="text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </small>
                    </p>
                  </div>
                ))}
                <p
                  className="text-sm text-blue-500 cursor-pointer hover:underline"
                  onClick={handleToggleCommentBox}
                >
                  Add a comment
                </p>
                {showCommentBox && (
                  <div className="mt-4">
                    <textarea
                      placeholder="Add your comment..."
                      rows={5}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {answers.length} Answers
          </h3>
          {answers.map((answer) => (
            <div
              className="flex mb-6 border-b pb-6 border-gray-200 dark:border-gray-700"
              key={answer._id}
            >
              {/* Voting */}
              <div className="flex flex-col items-center mr-6">
                <VoteButtons
                  voteCount={answer.voteCount}
                  onUpvote={() => handleAnswerVote("upvote", answer._id)}
                  onDownvote={() => handleAnswerVote("downvote", answer._id)}
                  userHasUpvoted={answer.userHasUpvoted}
                  userHasDownvoted={answer.userHasDownvoted}
                />
              </div>
              {/* Content */}
              <div className="flex-1">
                <TextContent content={answer.answer} type="answer" />
                {/* Author Info */}
                <div className="flex items-center justify-end mt-6">
                  <small className="text-gray-500 dark:text-gray-400 mr-2">
                    answered {new Date(answer.createdAt).toLocaleString()}
                  </small>
                  <div className="flex items-center">
                    <Avatar src={answer.user.profilePicture} />
                    <p className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {answer.user.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Form */}
        <div>
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
