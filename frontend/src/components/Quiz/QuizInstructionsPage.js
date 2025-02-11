// /frontend/src/components/Quiz/QuizInstructionsPage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";

function QuizInstructionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const res = await quizService.getQuizById(quizId);
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch quiz details");
        }
        setQuizData(res.quiz);
      } catch (error) {
        console.error("Error fetching quiz details:", error);
        toast.error(error.message || "Failed to fetch quiz details");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleBegin = async () => {
    try {
      const res = await quizService.startQuizAttempt(quizId);
      if (!res.success) {
        throw new Error(res.message || "Failed to start quiz attempt");
      }
      const { attemptId } = res;
      navigate(`/quiz/${quizId}/attempt/${attemptId}`);
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      toast.error(error.message || "Failed to start quiz attempt");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

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

  // Format the quiz title to display a quiz number.
  const extractQuizNumber = (title) => {
    return title.replace(/quiz\s*/i, "");
  };
  const quizNumber = extractQuizNumber(quizData.title);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        Quiz {quizNumber} Instructions
      </h2>
      {/* Render the instructions set by the professor */}
      <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
        {quizData.instructions}
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
