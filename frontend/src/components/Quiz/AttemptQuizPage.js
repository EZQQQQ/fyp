// /frontend/src/components/Quiz/AttemptQuizPage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";

function AttemptQuizPage() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  // For each question, store selectedOptionId as array or single value
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Fetch quiz details
        const res = await quizService.getQuizById(quizId);
        if (!res.success) {
          throw new Error(res.message || "Failed to load quiz");
        }

        const fetchedQuiz = res.quiz; // e.g., { _id, title, questions: [...] }
        setQuiz(fetchedQuiz);

        // Initialize answers array
        const initAnswers = fetchedQuiz.questions.map((q) => ({
          questionId: q._id,
          selectedOptionId: q.allowMultipleCorrect ? [] : null,
        }));
        setAnswers(initAnswers);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        toast.error(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Toggle an option for a question
  const handleOptionChange = (qIdx, optionId) => {
    setAnswers((prev) =>
      prev.map((ans, idx) => {
        if (idx !== qIdx) return ans;

        const question = quiz.questions[qIdx];

        if (question.allowMultipleCorrect) {
          // Toggle in or out of array
          const alreadySelected = ans.selectedOptionId.includes(optionId);
          if (alreadySelected) {
            return {
              ...ans,
              selectedOptionId: ans.selectedOptionId.filter((id) => id !== optionId),
            };
          } else {
            return {
              ...ans,
              selectedOptionId: [...ans.selectedOptionId, optionId],
            };
          }
        } else {
          // Single choice
          return {
            ...ans,
            selectedOptionId: optionId,
          };
        }
      })
    );
  };

  // Submit the attempt
  const handleSubmit = async () => {
    try {
      const attemptData = { answers };
      const res = await quizService.submitQuizAttempt(quizId, attemptId, attemptData);

      if (res.quizAttempt) {
        toast.success(`Quiz submitted! Score: ${res.quizAttempt.score}`);
        navigate(`/quiz/${quizId}/results/${res.quizAttempt._id}`);
      } else {
        toast.success("Quiz submitted!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit quiz");
    }
  };

  // Handle session termination on component unmount or page close
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      e.preventDefault();
      // Attempt to end the quiz attempt session
      try {
        await quizService.endQuizAttempt(quizId, attemptId);
      } catch (error) {
        console.error("Error ending quiz attempt:", error);
      }
      // Note: Some browsers may not support async operations here
      e.returnValue = "Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // End the quiz attempt when the component unmounts
      quizService.endQuizAttempt(quizId, attemptId).catch((error) => {
        console.error("Error ending quiz attempt:", error);
      });
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizId, attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500">No quiz found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">{quiz.title}</h2>

      {quiz.questions.map((q, qIdx) => (
        <div key={q._id} className="mb-6">
          <p className="font-medium text-lg mb-2">
            {qIdx + 1}. {q.questionText}
          </p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const selected = q.allowMultipleCorrect
                ? answers[qIdx].selectedOptionId.includes(opt._id)
                : answers[qIdx].selectedOptionId === opt._id;

              return (
                <label key={opt._id} className="flex items-center cursor-pointer">
                  <input
                    type={q.allowMultipleCorrect ? "checkbox" : "radio"}
                    className="mr-2"
                    checked={!!selected}
                    onChange={() => handleOptionChange(qIdx, opt._id)}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{opt.optionText}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end mt-8">
        <Button color="blue" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
}

export default AttemptQuizPage;
