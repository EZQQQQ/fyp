// frontend/src/hooks/useBookmark.js

import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { toggleBookmark } from "../features/bookmarkSlice";

/**
 * A custom hook that manages whether a question is bookmarked,
 * using Redux state from bookmarkSlice.
 */
function useBookmark(questionId) {
  const dispatch = useDispatch();
  const { bookmarkedQuestions, loading, error } = useSelector(
    (state) => state.bookmark
  );

  // Derived state: check if questionId is in the Redux array
  const isBookmarked = bookmarkedQuestions.includes(questionId);

  const handleBookmarkToggle = async () => {
    try {
      // Dispatch the thunk from the slice
      await dispatch(toggleBookmark(questionId)).unwrap();
      // Once fulfilled, the slice updates bookmarkedQuestions in Redux
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  useEffect(() => {
    if (error) {
      console.error("Bookmark error:", error);
    }
    // If you want to show a spinner while loading, you can do so here
  }, [error]);

  return { isBookmarked, handleBookmarkToggle, loading };
}

export default useBookmark;
