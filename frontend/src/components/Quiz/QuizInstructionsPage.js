// /frontend/src/components/Quiz/QuizInstructionsPage.js

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import TextContent from "../ViewQuestion/TextContent";

function QuizInstructionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, fetch quiz details and check for an existing attempt.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quiz details
        const res = await quizService.getQuizById(quizId);
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch quiz details");
        }
        setQuizData(res.quiz);

        // Check for an existing attempt.
        const attemptRes = await quizService.getQuizAttemptByQuiz(quizId);
        if (attemptRes.success && attemptRes.attempt) {
          toast.info("You have already attempted this quiz.");
          navigate(`/quiz/${quizId}/attempt/${attemptRes.attempt._id}/results`, { replace: true });
          return;
        }
        // If no attempt is found, attemptRes will have success: false (but no error thrown)
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        toast.error(error.message || "Failed to fetch quiz details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, navigate]);

  // Handler for when the user clicks "Begin"
  const handleBegin = useCallback(async () => {
    try {
      // Double-check if an attempt already exists.
      const attemptRes = await quizService.getQuizAttemptByQuiz(quizId);
      if (attemptRes.success && attemptRes.attempt) {
        toast.info("You have already attempted this quiz.");
        navigate(`/quiz/${quizId}/attempt/${attemptRes.attempt._id}/results`, { replace: true });
        return;
      }
      // Otherwise, start a new quiz attempt.
      const res = await quizService.startQuizAttempt(quizId);
      if (!res.success) {
        throw new Error(res.message || "Failed to start quiz attempt");
      }
      // Extract attempt ID from either field; adjust as needed.
      const attemptId = res.attemptId || (res.attempt && res.attempt._id);
      if (!attemptId) {
        throw new Error("Attempt ID is undefined. Please try again later.");
      }
      navigate(`/quiz/${quizId}/attempt/${attemptId}`);
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      toast.error(error.message || "Failed to start quiz attempt");
    }
  }, [quizId, navigate]);

  // Handler for cancelling (go back)
  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Loading instructions...
        </p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500">No quiz found.</p>
      </div>
    );
  }

  // Extract the quiz number from the title for display (optional)
  const extractQuizNumber = (title) => title.replace(/quiz\s*/i, "");
  const quizNumber = extractQuizNumber(quizData.title);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        Quiz {quizNumber} Instructions
      </h2>
      <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
        <TextContent content={quizData.instructions} type="html" />
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button
          onClick={handleCancel}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400"
        >
          Cancel
        </Button>
        <Button
          onClick={handleBegin}
          className="bg-gray-800 text-gray-100 hover:bg-gray-900 focus:outline-none focus:ring focus:ring-gray-600 dark:bg-gray-500 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          Begin
        </Button>
      </div>
    </div>
  );
}

export default QuizInstructionsPage;
