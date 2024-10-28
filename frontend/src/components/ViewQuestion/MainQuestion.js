// /frontend/src/components/ViewQuestion/MainQuestion.js

import React, { useState, useEffect } from "react";
import {
  Bookmark,
  History,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { Avatar, Button } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import "./MainQuestion.css";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import axiosInstance from "../../utils/axiosConfig";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";

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
    <div className="main">
      <div className="main-container">
        {/* Header Section */}
        <div className="main-top">
          <h2 className="main-question-title">{question?.title}</h2>
          <Link to="/add-question">
            <Button
              variant="contained"
              color="primary"
              startIcon={<QuestionAnswerIcon />}
            >
              Ask Question
            </Button>
          </Link>
        </div>

        {/* Question Info */}
        <div className="main-desc">
          <div className="info">
            <p>
              Asked:{" "}
              <span>{new Date(question?.createdAt).toLocaleString()}</span>
            </p>
            <p>
              Active:{" "}
              <span>{new Date(question?.updatedAt).toLocaleString()}</span>
            </p>
            <p>
              Viewed: <span>{question?.views || 0} times</span>
            </p>
          </div>
        </div>

        {/* Question Content */}
        <div className="question-section">
          <div className="question-container">
            {/* Voting and Options */}
            <div className="question-options">
              {/* Voting Container */}
              <div className="vote-container">
                <ArrowUpward className="vote-icon" />
                <p className="vote-count">0</p>
                <ArrowDownward className="vote-icon" />
              </div>
              {/* Options Container */}
              <div className="options-container">
                <Bookmark className="option-icon" />
                <History className="option-icon" />
              </div>
            </div>

            {/* Question and Author Details */}
            <div className="question-content">
              <p className="question-body">{question?.content}</p>
              {/* Display files if any */}
              {question?.files?.map((fileUrl, index) => (
                <div key={index}>
                  <img src={fileUrl} alt={`Attachment ${index}`} />
                </div>
              ))}
              {/* Display poll options if any */}
              {question?.pollOptions?.length > 0 && (
                <div className="poll-options">
                  <h3>Poll Options:</h3>
                  <ul>
                    {question.pollOptions.map((option, index) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="author-info">
                <small>
                  asked {new Date(question?.createdAt).toLocaleString()}
                </small>
                <div className="author-details">
                  <Avatar src={question?.user?.profilePicture} />
                  <p>{question?.user?.name}</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                {comments.map((comment) => (
                  <div className="comment" key={comment._id}>
                    <p>
                      {comment.comment} - <span>{comment.user.name}</span>{" "}
                      <small>
                        {new Date(comment.createdAt).toLocaleString()}
                      </small>
                    </p>
                  </div>
                ))}
                <p className="add-comment" onClick={handleToggleCommentBox}>
                  Add a comment
                </p>
                {showCommentBox && (
                  <div className="comment-box">
                    <textarea
                      placeholder="Add your comment..."
                      rows={5}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    ></textarea>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCommentSubmit}
                    >
                      Add Comment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="answers-section">
          <h3>{answers.length} Answers</h3>
          {answers.map((answer) => (
            <div className="answer-container" key={answer._id}>
              <div className="question-options">
                <div className="vote-container">
                  <ArrowUpward className="vote-icon" />
                  <p className="vote-count">0</p>
                  <ArrowDownward className="vote-icon" />
                </div>
              </div>
              <div className="answer-content">
                <p>{answer.answer}</p>
                <div className="author-info">
                  <small>
                    answered {new Date(answer.createdAt).toLocaleString()}
                  </small>
                  <div className="author-details">
                    <Avatar src={answer.user.profilePicture} />
                    <p>{answer.user.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Form */}
        <div className="main-answer">
          <h3>Your Answer</h3>
          <div className="editor-container">
            <MarkdownEditor
              value={answerText}
              onChange={setAnswerText}
              placeholder="Write your answer here..."
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            className="post-answer-button"
            onClick={handleAnswerSubmit}
          >
            Post Your Answer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MainQuestion;
