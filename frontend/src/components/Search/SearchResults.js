// frontend/src/components/Search/SearchResults.js

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import QuestionCard from "../KnowledgeNode/QuestionCard";
import useSearchQuestions from "../../hooks/useSearchQuestions";
import { useDispatch, useSelector } from "react-redux";
import { setVoteData } from "../../features/voteSlice";
import { selectUser } from "../../features/userSlice";
import { toast } from "react-toastify";

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

  useEffect(() => {
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

  return (
    <div className="p-4 md:p-6 overflow-x-hidden">
      <h1 className="text-2xl font-semibold mb-4">Search Results</h1>
      {questions.length > 0 ? (
        <div className="flex flex-col space-y-6">
          {questions.map((question) => (
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
