// frontend/src/components/Search/SearchResults.js

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import QuestionCard from "../KnowledgeNode/QuestionCard";
import useSearchQuestions from "../../hooks/useSearchQuestions";
import { useDispatch, useSelector } from "react-redux";
import { setVoteData } from "../../features/voteSlice";
import { selectUser } from "../../features/userSlice";
import { toast } from "react-toastify";
import FilterDropdown from "../KnowledgeNode/FilterDropdown";

function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";
  const communityId = queryParams.get("community") || "all";

  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const {
    questions: fetchedQuestions,
    loading,
    error,
  } = useSearchQuestions(searchQuery, communityId);

  const [questions, setQuestions] = useState([]);

  // Filter state and options
  const [filter, setFilter] = useState("newest");
  const filterOptions = [
    { label: "Newest", value: "newest" },
    { label: "Popular", value: "popular" },
  ];
  const selectedFilter = filterOptions.find((opt) => opt.value === filter);

  const handleFilterChange = (option) => {
    setFilter(option.value);
  };

  useEffect(() => {
    // console.log("Fetched Questions:", fetchedQuestions);
    setQuestions(fetchedQuestions || []);

    fetchedQuestions.forEach((question) => {
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
  }, [fetchedQuestions, dispatch]);

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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    toast.error(
      error.response?.data?.message || "Failed to load search results."
    );
    return <p>Error fetching search results.</p>;
  }

  // Sort questions based on filter selection
  const sortedQuestions = [...questions].sort((a, b) => {
    if (filter === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === "popular") {
      return b.voteCount - a.voteCount;
    }
    return 0;
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    toast.error(
      error.response?.data?.message || "Failed to load search results."
    );
    return <p>Error fetching search results.</p>;
  }

  return (
    <div className="p-4 md:p-6 overflow-x-hidden">
      {/* Header Section with Filter Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Search Results
        </h1>
        <FilterDropdown
          options={filterOptions}
          selected={selectedFilter}
          onSelect={handleFilterChange}
          buttonClassName="text-xs sm:text-sm px-2 py-1"
          optionClassName="text-xs sm:text-sm px-4 py-2"
        />
      </div>
      {sortedQuestions.length > 0 ? (
        <div className="flex flex-col space-y-6">
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
          No results found.
        </p>
      )}
    </div>
  );
}

export default SearchResults;