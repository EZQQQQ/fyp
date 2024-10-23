import React, { useState } from "react";
import {
  Bookmark,
  History,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import "./MainQuestion.css";
import MarkdownEditor from "../TextEditor/MarkdownEditor";

function MainQuestion() {
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleToggleCommentBox = () => {
    setShowCommentBox(!showCommentBox);
  };

  return (
    <div className="main">
      <div className="main-container">
        {/* Header Section */}
        <div className="main-top">
          <h2 className="main-question-title">This is the question title</h2>
          <Link to="/add-question">
            <Button
              variant="contained"
              color="primary"
              icon={<QuestionAnswerIcon />}
            >
              Ask Question
            </Button>
          </Link>
        </div>

        {/* Question Info */}
        <div className="main-desc">
          <div className="info">
            <p>
              Asked: <span>Timestamp</span>
            </p>
            <p>
              Active: <span>today</span>
            </p>
            <p>
              Viewed: <span>8309410 times</span>
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
              <p className="question-body">This is the question body</p>
              <div className="author-info">
                <small>asked "Timestamp"</small>
                <div className="author-details">
                  <Avatar />
                  <p>Author Name</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <div className="comment">
                  <p>
                    This is a comment - <span>User name</span>{" "}
                    <small>Timestamp</small>
                  </p>
                </div>
                <p className="add-comment" onClick={handleToggleCommentBox}>
                  Add a comment
                </p>
                {showCommentBox && (
                  <div className="comment-box">
                    <textarea
                      placeholder="Add your comment..."
                      rows={5}
                    ></textarea>
                    <Button variant="contained" color="primary">
                      Add Comment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Answer Section */}
        <div className="main-answer">
          <h3>Your Answer</h3>
          <div className="editor-container">
            <MarkdownEditor />
          </div>
          <Button
            variant="contained"
            color="primary"
            className="post-answer-button"
          >
            Post Your Answer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MainQuestion;
