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
        const isQuestionCorrect =
          userAnswer.selectedOptionId.length === correctOptions.length &&
          userAnswer.selectedOptionId.every((id) =>
            correctOptions.some((correctId) => correctId.toString() === id.toString())
          );

        return (
          <div key={q._id} className="mb-6 border-b pb-4">
            <p className="font-medium text-lg">
              {qIdx + 1}. {q.questionText}
            </p>
            <ul className="ml-4">
              {q.options.map((option) => {
                const wasSelected = userAnswer.selectedOptionId.some(
                  (id) => id.toString() === option._id.toString()
                );
                const isCorrectOption = option.isCorrect;
                let optionClasses = "p-2 border rounded mb-2 flex items-center justify-between";
                let icon = null;

                if (wasSelected && isCorrectOption) {
                  optionClasses += " bg-green-100 border-green-500 text-green-700";
                  icon = <span className="ml-2">&#10003;</span>; // tick
                } else if (wasSelected && !isCorrectOption) {
                  optionClasses += " bg-red-100 border-red-500 text-red-700";
                  icon = <span className="ml-2">&#10007;</span>; // cross
                } else if (!wasSelected && isCorrectOption) {
                  // Show correct answer even if not selected
                  optionClasses += " bg-green-50 border-green-300 text-green-700";
                  icon = <span className="ml-2">&#10003;</span>;
                } else {
                  optionClasses += " bg-gray-50 border-gray-300 text-gray-700";
                }

                return (
                  <li key={option._id} className={optionClasses}>
                    <span>{option.optionText}</span>
                    {(wasSelected || isCorrectOption) && icon}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2">
              <span className="font-semibold">Result: </span>
              {isQuestionCorrect ? (
                <span className="text-green-600">Correct</span>
              ) : (
                <span className="text-red-600">Incorrect</span>
              )}
            </p>
            {q.explanation && (
              <div className="mt-2 p-2 border-l-4 border-gray-400">
                <p className="italic text-sm text-gray-600 dark:text-gray-400">
                  Explanation: {q.explanation}
                </p>
              </div>
            )}
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
