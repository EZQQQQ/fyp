// /frontend/src/components/ViewQuestion/MainQuestion.js

import React, { useState, useEffect } from "react";
import {
  Bookmark,
  History,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { Avatar } from "@mui/material"; // Keep Avatar if you wish to use it
import { Link, useParams } from "react-router-dom";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import axiosInstance from "../../utils/axiosConfig";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import TextContent from "./TextContent";

function MainQuestion() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axiosInstance.get(`/question/${questionId}`);
        setQuestion(response.data.data);
        setComments(response.data.data.comments || []);
        setAnswers(response.data.data.answers || []);
      } catch (error) {
        console.error("Error fetching question:", error.response?.data);
      }
    };
    fetchQuestion();
  }, [questionId]);

  // Handle upvote for question
  const handleQuestionUpvote = async () => {
    try {
      const response = await axiosInstance.post(
        `/question/${questionId}/upvote`
      );
      setQuestion({ ...question, voteCount: response.data.data.voteCount });
    } catch (error) {
      console.error("Error upvoting question:", error.response?.data);
    }
  };

  // Handle downvote for question
  const handleQuestionDownvote = async () => {
    try {
      const response = await axiosInstance.post(
        `/question/${questionId}/downvote`
      );
      setQuestion({ ...question, voteCount: response.data.data.voteCount });
    } catch (error) {
      console.error("Error downvoting question:", error.response?.data);
    }
  };

  // Handle upvote for answer
  const handleAnswerUpvote = async (answerId) => {
    try {
      const response = await axiosInstance.post(`/answer/${answerId}/upvote`);
      const updatedAnswers = answers.map((ans) =>
        ans._id === answerId
          ? { ...ans, voteCount: response.data.data.voteCount }
          : ans
      );
      setAnswers(updatedAnswers);
    } catch (error) {
      console.error("Error upvoting answer:", error.response?.data);
    }
  };

  // Handle downvote for answer
  const handleAnswerDownvote = async (answerId) => {
    try {
      const response = await axiosInstance.post(`/answer/${answerId}/downvote`);
      const updatedAnswers = answers.map((ans) =>
        ans._id === answerId
          ? { ...ans, voteCount: response.data.data.voteCount }
          : ans
      );
      setAnswers(updatedAnswers);
    } catch (error) {
      console.error("Error downvoting answer:", error.response?.data);
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
    } catch (error) {
      console.error("Error adding comment:", error.response?.data);
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
    } catch (error) {
      console.error("Error adding answer:", error.response?.data);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-4 sm:mb-0 text-gray-900 dark:text-gray-100">
            {question?.title}
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
                {new Date(question?.createdAt).toLocaleString()}
              </span>
            </p>
            <p className="mr-4">
              Active:{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {new Date(question?.updatedAt).toLocaleString()}
              </span>
            </p>
            <p>
              Viewed:{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {question?.views || 0} times
              </span>
            </p>
          </div>
        </div>

        {/* Question Section */}
        <div className="mb-8">
          <div className="flex">
            {/* Voting */}
            <div className="flex flex-col items-center mr-6">
              <ArrowUpward
                className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                onClick={handleQuestionUpvote}
              />
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {question?.voteCount || 0}
              </p>
              <ArrowDownward
                className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                onClick={handleQuestionDownvote}
              />
            </div>
            {/* Content */}
            <div className="flex-1">
              <TextContent content={question?.content} type="question" />

              {/* Files */}
              {question?.files?.map((fileUrl, index) => (
                <div key={index} className="my-4">
                  <img
                    src={fileUrl}
                    alt={`Attachment ${index}`}
                    className="max-w-full rounded-md"
                  />
                </div>
              ))}

              {/* Poll Options */}
              {question?.pollOptions?.length > 0 && (
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
                  asked {new Date(question?.createdAt).toLocaleString()}
                </small>
                <div className="flex items-center">
                  <Avatar src={question?.user?.profilePicture} />
                  <p className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {question?.user?.name}
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
                <ArrowUpward
                  className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                  onClick={() => handleAnswerUpvote(answer._id)}
                />
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {answer.voteCount || 0}
                </p>
                <ArrowDownward
                  className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                  onClick={() => handleAnswerDownvote(answer._id)}
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
