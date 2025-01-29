// /frontend/src/components/Quiz/QuizResultsPage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";

function QuizResultsPage() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!attemptId) {
          throw new Error("Attempt ID is missing.");
        }

        const res = await quizService.getQuizAttempt(quizId, attemptId);
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch quiz results");
        }
        setQuizAttempt(res.quizAttempt);
      } catch (error) {
        console.error("Error fetching quiz results:", error);
        toast.error(error.message || "Failed to fetch quiz results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId, attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading results...</p>
      </div>
    );
  }

  if (!quizAttempt) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500">No results found.</p>
      </div>
    );
  }

  const { quiz, score, totalPossibleScore, answers } = quizAttempt;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Quiz Results</h2>
      <p className="mb-6 text-lg">
        Score: {score} / {totalPossibleScore}
      </p>

      {quiz.questions.map((q, qIdx) => {
        const userAnswer = answers[qIdx];
        const correctOptions = q.options.filter((opt) => opt.isCorrect).map((opt) => opt._id);
        const isCorrect = userAnswer.selectedOptionId.length === correctOptions.length &&
          userAnswer.selectedOptionId.every((id) => correctOptions.includes(id));

        return (
          <div key={q._id} className="mb-6">
            <p className="font-medium text-lg">
              {qIdx + 1}. {q.questionText}
            </p>
            <div className="ml-4">
              <p>
                <span className="font-semibold">Your Answer:</span>{" "}
                {q.allowMultipleCorrect
                  ? userAnswer.selectedOptionId.map((id) => {
                    const option = q.options.find((opt) => opt._id === id);
                    return option ? option.optionText : "Unknown Option";
                  }).join(", ")
                  : (() => {
                    const option = q.options.find((opt) => opt._id === userAnswer.selectedOptionId);
                    return option ? option.optionText : "No Answer";
                  })()}
              </p>
              <p>
                <span className="font-semibold">Correct Answer:</span>{" "}
                {q.allowMultipleCorrect
                  ? correctOptions.map((id) => {
                    const option = q.options.find((opt) => opt._id === id);
                    return option ? option.optionText : "Unknown Option";
                  }).join(", ")
                  : (() => {
                    const option = q.options.find((opt) => opt._id === correctOptions[0]);
                    return option ? option.optionText : "No Correct Answer";
                  })()}
              </p>
              <p>
                <span className="font-semibold">Result:</span>{" "}
                {isCorrect ? (
                  <span className="text-green-600">Correct</span>
                ) : (
                  <span className="text-red-600">Incorrect</span>
                )}
              </p>
            </div>
          </div>
        );
      })}

      <div className="flex justify-end mt-8">
        <Button
          color="blue"
          onClick={() => navigate(`/communities/${quiz.community}/`)}
        >
          Back to Community
        </Button>
      </div>
    </div>
  );
}

export default QuizResultsPage;
