// AllQuestions.js
import React from "react";
import { Avatar, Button, ButtonGroup } from "@mui/material";
import { Link } from "react-router-dom";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import "./css/AllQuestions.css";

function AllQuestions() {
  return (
    <div className="all-questions">
      {/* Header Section */}
      <div className="all-questions-header">
        <h1>All Questions</h1>
        <div className="header-actions">
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
      </div>

      {/* Filter Section */}
      <div className="all-questions-filter">
        <ButtonGroup
          variant="outlined"
          color="primary"
          className="filter-options"
        >
          <Button className="filter-button">Newest</Button>
          <Button className="filter-button">Popular</Button>
        </ButtonGroup>
      </div>

      {/* Questions List */}
      <div className="all-questions-list">
        <div className="question-container">
          <div className="question-stats">
            <div className="stats-item">
              <p>0</p>
              <span>Votes</span>
            </div>
            <div className="stats-item">
              <p>0</p>
              <span>Answers</span>
            </div>
            <div className="stats-item">
              <p>0</p>
              <span>Views</span>
            </div>
          </div>
          <div className="question-details">
            <Link to="/question" className="question-title">
              This is the question title
            </Link>
            <div className="question-description">
              This is the question description
            </div>
            <div className="question-footer">
              <small>Timestamp</small>
              <div className="author-info">
                <Avatar />
                <p>User Name</p>
              </div>
            </div>
          </div>
        </div>
        {/* You can map over your questions data to display multiple questions */}
      </div>
    </div>
  );
}

export default AllQuestions;
