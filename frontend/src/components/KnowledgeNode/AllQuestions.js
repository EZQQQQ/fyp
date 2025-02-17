// frontend/src/components/KnowledgeNode/AllQuestions.js

import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import QuestionCard from "./QuestionCard";
import FilterDropdown from "./FilterDropdown";
import { useDispatch, useSelector } from "react-redux";
import { setVoteData } from "../../features/voteSlice";
import { selectUser } from "../../features/userSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateQuestionButton from "./CreateQuestionButton";

function AllQuestions() {
  const [filter, setFilter] = useState("newest");
  const [questions, setQuestions] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleFilterChange = (option) => {
    setFilter(option.value);
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
    const fetchQuestions = async () => {
      try {
        const response = await axiosInstance.get("/question/user-questions");
        setQuestions(response.data.data || []);
        response.data.data.forEach((question) => {
          dispatch(
            setVoteData({
              targetId: question._id,
              voteInfo: {
                voteCount: question.voteCount,
                userHasUpvoted: question.voteCount,
                userHasDownvoted: question.voteCount,
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
      fetchQuestions();
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

  const filterOptions = [
    { label: "Newest", value: "newest" },
    { label: "Popular", value: "popular" },
  ];

  const selectedFilter = filterOptions.find((opt) => opt.value === filter);

  return (
    <div className="max-w-7xl mx-auto p-2 overflow-x-hidden">
      {/* Header Section: arranged in one horizontal row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          All Questions
        </h1>
        <div className="flex items-center gap-2">
          {/* Create Question Button with extra-small padding/text on mobile */}
          <CreateQuestionButton
            communityId={communityId}
            className="text-xs sm:text-sm px-2 py-1"
          />
          {/* Filter Dropdown */}
          <FilterDropdown
            options={filterOptions}
            selected={selectedFilter}
            onSelect={handleFilterChange}
            buttonClassName="text-xs sm:text-sm px-2 py-1"
            optionClassName="text-xs sm:text-sm px-4 py-2"
          />
        </div>
      </div>

      {/* Questions List Container */}
      <div className="all-questions-container">
        {questions.length > 0 ? (
          <div className="flex flex-col space-y-4">
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
            No questions available from your communities. Join some communities to see questions!
          </p>
        )}
      </div>
    </div>
  );
}

export default AllQuestions;
