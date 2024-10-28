// /frontend/src/components/KnowledgeNode/Main.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import FilterListIcon from "@mui/icons-material/FilterList";
import AllQuestion from "./AllQuestions";
import axiosInstance from "../../utils/axiosConfig";
import FilterButton from "./FilterButton";

function Main() {
  const [filter, setFilter] = useState("newest");
  const [questions, setQuestions] = useState([]);

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
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
    <div className="flex flex-col p-6 flex-3">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          All Questions
        </h2>
        <Link to="/add-question">
          <button
            type="button"
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            <QuestionAnswerIcon className="mr-2" />
            Ask Question
          </button>
        </Link>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-4 md:mb-0">
          <FilterButton
            label="Newest"
            active={filter === "newest"}
            onClick={() => handleFilterChange("newest")}
          />
          <FilterButton
            label="Active"
            active={filter === "active"}
            onClick={() => handleFilterChange("active")}
          />
          <FilterButton
            label="Unanswered"
            active={filter === "unanswered"}
            onClick={() => handleFilterChange("unanswered")}
          />
        </div>
        {/* Filter Icon */}
        <div className="flex items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
          <FilterListIcon className="mr-2" />
          <span>Filter</span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {sortedQuestions.map((question) => (
          <AllQuestion key={question._id} question={question} />
        ))}
      </div>
    </div>
  );
}

export default Main;
