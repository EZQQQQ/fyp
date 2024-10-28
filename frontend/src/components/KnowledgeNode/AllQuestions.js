// /frontend/src/components/KnowledgeNode/AllQuestions.js

import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import axiosInstance from "../../utils/axiosConfig";
import QuestionCard from "./QuestionCard";
import FilterButton from "./FilterButton"; // Import the reusable component

function AllQuestions() {
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
    <div className="p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          All Questions
        </h1>
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
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <FilterButton
            label="Newest"
            active={filter === "newest"}
            onClick={() => handleFilterChange("newest")}
            rounded="rounded-l-md"
          />
          <FilterButton
            label="Popular"
            active={filter === "popular"}
            onClick={() => handleFilterChange("popular")}
            rounded="rounded-r-md"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {sortedQuestions.map((question) => (
          <QuestionCard key={question._id} question={question} />
        ))}
      </div>
    </div>
  );
}

export default AllQuestions;
