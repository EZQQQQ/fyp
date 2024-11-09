// frontend/src/components/Search/SearchResults.js

import React from "react";
import { useLocation } from "react-router-dom";
import QuestionCard from "../KnowledgeNode/QuestionCard";
import useSearchQuestions from "../../hooks/useSearchQuestions";

function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";
  const communityId = queryParams.get("community") || "all";

  const { questions, loading, error } = useSearchQuestions(
    searchQuery,
    communityId
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error fetching search results.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Search Results</h1>
      {questions.length > 0 ? (
        <div className="space-y-6">
          {questions.map((question) => (
            <QuestionCard
              key={question._id}
              question={question}
              updateQuestionVote={() => {}}
            />
          ))}
        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}

export default SearchResults;
