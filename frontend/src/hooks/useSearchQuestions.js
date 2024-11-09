// frontend/src/hooks/useSearchQuestions.js

import { useState, useEffect } from "react";
import questionService from "../services/questionService";

const useSearchQuestions = (query, community) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await questionService.searchQuestions(
          query,
          community
        );
        setQuestions(response.data.data || []);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setQuestions([]);
      setLoading(false);
    }
  }, [query, community]);

  return { questions, loading, error };
};

export default useSearchQuestions;
