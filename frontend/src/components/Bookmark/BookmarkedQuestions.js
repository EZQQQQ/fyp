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
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
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
        setQuestions(response.data || []);

        response.data.forEach((question) => {
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
  }, [dispatch, user]);

  const sortedQuestions = [...questions].sort((a, b) => {
    if (filter === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === "popular") {
      return b.voteCount - a.voteCount;
    }
    return 0;
  });

  const communityId = user?.currentCommunityId || null;

  return (
    <div className="p-4 md:p-6 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Bookmarked Questions
        </h1>
        <div className="flex flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 justify-between">

          {/* Filter Buttons on the right */}
          <div className="inline-flex rounded-md shadow-sm">
            <FilterDropdown
              label="Newest"
              active={filter === "newest"}
              onClick={() => handleFilterChange("newest")}
              rounded="rounded-l-md"
            />
            <FilterDropdown
              label="Popular"
              active={filter === "popular"}
              onClick={() => handleFilterChange("popular")}
              rounded="rounded-r-md"
            />
          </div>
        </div>
      </div>

      {/* Questions List Container */}
      <div className="all-questions-container overflow-y-auto">
        {questions.length > 0 ? (
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
            No bookmarked questions yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default BookmarkedQuestions;
