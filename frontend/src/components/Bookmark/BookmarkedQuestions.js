// frontend/src/components/Bookmark/BookmarkedQuestions.js

import React, { useState, useEffect } from "react";
import bookmarkService from "../../services/bookmarkService";
import QuestionCard from "../KnowledgeNode/QuestionCard";
import FilterDropdown from "../KnowledgeNode/FilterDropdown";
import { useDispatch, useSelector } from "react-redux";
import { setVoteData } from "../../features/voteSlice";
import { selectUser } from "../../features/userSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BookmarkedQuestions() {
  const [filter, setFilter] = useState("newest");
  const [questions, setQuestions] = useState([]);
  const [displayOrder, setDisplayOrder] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Define filter options that the dropdown will use
  const filterOptions = [
    { label: "Newest", value: "newest" },
    { label: "Popular", value: "popular" },
  ];

  // Update display order when filter changes
  const updateDisplayOrder = (questionsList, currentFilter) => {
    const sortedIds = [...questionsList].sort((a, b) => {
      if (currentFilter === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (currentFilter === "popular") {
        return b.voteCount - a.voteCount;
      }
      return 0;
    }).map(q => q._id);

    setDisplayOrder(sortedIds);
  };

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
    updateDisplayOrder(questions, filterValue);
  };

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

  useEffect(() => {
    const fetchBookmarkedQuestions = async () => {
      try {
        const response = await bookmarkService.fetchUserBookmarks();
        const fetchedQuestions = response.data || [];
        setQuestions(fetchedQuestions);

        // Set initial display order
        updateDisplayOrder(fetchedQuestions, filter);

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
      } catch (error) {
        console.error("Error fetching questions:", error.response?.data);
        toast.error(
          error.response?.data?.message || "Failed to load questions."
        );
      }
    };

    if (user) {
      fetchBookmarkedQuestions();
    }
  }, [dispatch, user, filter]);

  return (
    <div className="max-w-7xl mx-auto p-2 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Bookmarked Questions
        </h1>
        <div className="mt-0">
          {/* Pass the options, the selected option, and an onSelect handler */}
          <FilterDropdown
            options={filterOptions}
            selected={
              filterOptions.find((opt) => opt.value === filter) || filterOptions[0]
            }
            onSelect={(option) => handleFilterChange(option.value)}
            optionClassName="px-4 py-2"
          />
        </div>
      </div>

      {/* Questions List Container */}
      <div className="all-questions-container overflow-y-auto">
        {questions.length > 0 ? (
          <div className="flex flex-col space-y-6">
            {displayOrder.map((questionId) => {
              const question = questions.find((q) => q._id === questionId);
              return (
                <QuestionCard
                  key={question._id}
                  question={question}
                  updateQuestionVote={updateQuestionVote}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No bookmarked questions yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default BookmarkedQuestions;
