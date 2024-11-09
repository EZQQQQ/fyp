// /frontend/src/hooks/useVote.js

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setVoteData } from "../features/voteSlice";
import { toast } from "react-toastify";
import handleVote from "../services/votingService";

/**
 * Custom hook to handle voting actions for questions and answers.
 * @param {string} targetId - The ID of the question or answer.
 * @param {boolean} isQuestion - Flag indicating if the target is a question.
 * @param {Function} updateLocalState - Function to update the local state of the parent component.
 */
const useVote = (targetId, isQuestion, updateLocalState) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false); // To prevent rapid clicks

  const handleUpvote = async () => {
    if (loading) return; // Prevent multiple rapid clicks
    setLoading(true);
    try {
      const voteData = await handleVote("upvote", targetId, isQuestion);

      // Update Redux Store
      dispatch(
        setVoteData({
          targetId,
          voteInfo: {
            voteCount: voteData.voteCount,
            userHasUpvoted: voteData.userHasUpvoted,
            userHasDownvoted: voteData.userHasDownvoted,
          },
        })
      );

      // Update Local State via Callback
      if (updateLocalState) {
        updateLocalState(voteData);
      }

      // Show Toast Notification
      if (voteData.action === "voted") {
        toast.success("Upvoted successfully!");
      } else if (voteData.action === "removed") {
        toast.info("Upvote removed.");
      }
    } catch (error) {
      console.error(
        `Error during upvote on ${isQuestion ? "question" : "answer"}:`,
        error
      );
      toast.error(
        error || `Failed to upvote the ${isQuestion ? "question" : "answer"}.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownvote = async () => {
    if (loading) return; // Prevent multiple rapid clicks
    setLoading(true);
    try {
      const voteData = await handleVote("downvote", targetId, isQuestion);

      // Update Redux Store
      dispatch(
        setVoteData({
          targetId,
          voteInfo: {
            voteCount: voteData.voteCount,
            userHasUpvoted: voteData.userHasUpvoted,
            userHasDownvoted: voteData.userHasDownvoted,
          },
        })
      );

      // Update Local State via Callback
      if (updateLocalState) {
        updateLocalState(voteData);
      }

      // Show Toast Notification
      if (voteData.action === "voted") {
        toast.success("Downvoted successfully!");
      } else if (voteData.action === "removed") {
        toast.info("Downvote removed.");
      }
    } catch (error) {
      console.error(
        `Error during downvote on ${isQuestion ? "question" : "answer"}:`,
        error
      );
      toast.error(
        error || `Failed to downvote the ${isQuestion ? "question" : "answer"}.`
      );
    } finally {
      setLoading(false);
    }
  };

  return { handleUpvote, handleDownvote, loading };
};

export default useVote;
