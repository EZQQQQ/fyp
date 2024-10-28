// /frontend/src/components/KnowledgeNode/AllQuestions.js

import React, { useState, useEffect } from "react";
import { Avatar, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Link } from "react-router-dom";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import "./css/AllQuestions.css";
import axiosInstance from "../../utils/axiosConfig";

function AllQuestions() {
  const [filter, setFilter] = useState("newest");
  const [questions, setQuestions] = useState([]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axiosInstance.get("/question");
        setQuestions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching questions:", error.response?.data);
      }
    };
    fetchQuestions();
  }, []);

  // Sort questions based on selected filter
  const sortedQuestions = [...questions].sort((a, b) => {
    if (filter === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === "popular") {
      return b.views - a.views;
    }
    return 0;
  });

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
              startIcon={<QuestionAnswerIcon />}
            >
              Ask Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="all-questions-filter">
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="Filter questions"
          className="filter-options"
        >
          <ToggleButton
            value="newest"
            aria-label="Newest"
            className="filter-button"
          >
            Newest
          </ToggleButton>
          <ToggleButton
            value="popular"
            aria-label="Popular"
            className="filter-button"
          >
            Popular
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* Questions List */}
      <div className="all-questions-list">
        {sortedQuestions.map((question) => (
          <div className="question-container" key={question._id}>
            <div className="question-stats">
              <div className="stats-item">
                <p>{question.votes || 0}</p>
                <span>Votes</span>
              </div>
              <div className="stats-item">
                <p>{question.answers?.length || 0}</p>
                <span>Answers</span>
              </div>
              <div className="stats-item">
                <p>{question.views || 0}</p>
                <span>Views</span>
              </div>
            </div>
            <div className="question-details">
              <Link to={`/question/${question._id}`} className="question-title">
                {question.title}
              </Link>
              <div className="question-description">{question.content}</div>
              <div className="question-footer">
                <small>{new Date(question.createdAt).toLocaleString()}</small>
                <div className="author-info">
                  <Avatar src={question.user?.profilePicture} />
                  <p>{question.user?.name}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllQuestions;
