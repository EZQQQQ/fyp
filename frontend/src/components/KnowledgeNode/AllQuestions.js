// frontend/src/components/KnowledgeNode/AllQuestions.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import axiosInstance from "../../utils/axiosConfig";
import QuestionCard from "./QuestionCard";
import FilterButton from "./FilterButton";
import { useDispatch, useSelector } from "react-redux";
import { setVoteData } from "../../features/voteSlice";
import { selectUser } from "../../features/userSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AllQuestions() {
  const [filter, setFilter] = useState("newest");
  const [questions, setQuestions] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
  };

  // Function to update a specific question's vote data
  const updateQuestionVote = (questionId, voteData) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q._id === questionId
          ? {
              ...q,
              voteCount: voteData.voteCount,
              userHasUpvoted: voteData.userHasUpvoted,
              userHasDownvoted: voteData.userHasDownvoted,
            }
          : q
      )
    );
  };

  // Fetch Questions from User's Communities
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch questions from user's communities
        const response = await axiosInstance.get("/question/user-questions");

        setQuestions(response.data.data || []);

        // Initialize vote data in Redux
        response.data.data.forEach((question) => {
          dispatch(
            setVoteData({
              targetId: question._id,
              voteInfo: {
                voteCount: question.voteCount,
                userHasUpvoted: question.userHasUpvoted,
                userHasDownvoted: question.userHasDownvoted,
              },
            })
          );
        });
      } catch (error) {
        console.error("Error fetching questions:", error.response?.data);
        toast.error(
          error.response?.data?.message || "Failed to load questions."
        );
      }
    };

    // Only fetch if user is authenticated
    if (user) {
      fetchQuestions();
    }
  }, [dispatch, user]);

  // Sort questions based on selected filter
  const sortedQuestions = [...questions].sort((a, b) => {
    if (filter === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === "popular") {
      return b.voteCount - a.voteCount;
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
      {questions.length > 0 ? (
        <div className="space-y-6">
          {sortedQuestions.map((question) => (
            <QuestionCard
              key={question._id}
              question={question}
              updateQuestionVote={updateQuestionVote}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300">
          No questions available from your communities. Join some communities to
          see questions!
        </p>
      )}
    </div>
  );
}

export default AllQuestions;
