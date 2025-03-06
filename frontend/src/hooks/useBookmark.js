// frontend/src/hooks/useBookmark.js
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { toggleBookmark } from "../features/bookmarkSlice";
import { selectUser } from "../features/userSlice";

/**
 * A custom hook that manages whether a question is bookmarked.
 * It now reads bookmark status from both the current user slice and the bookmark slice.
 */
function useBookmark(questionId) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  // Get bookmark data from the bookmark slice.
  const bookmarkState = useSelector((state) => state.bookmark);

  // Only use bookmarked questions if there's a logged-in user
  const bookmarkedQuestions = user ?
    (bookmarkState.bookmarkedQuestions && bookmarkState.bookmarkedQuestions.length > 0)
      ? bookmarkState.bookmarkedQuestions
      : (user?.bookmarkedQuestions || [])
    : [];

  const isBookmarked = user ? bookmarkedQuestions.includes(questionId) : false;

  const handleBookmarkToggle = async () => {
    try {
      await dispatch(toggleBookmark(questionId)).unwrap();
      // Optionally, if you have an action to refresh the user data, you can dispatch it here.
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      console.error("No user found in useBookmark");
    }
  }, [user]);

  return { isBookmarked, handleBookmarkToggle, loading: bookmarkState.loading };
}

export default useBookmark;
