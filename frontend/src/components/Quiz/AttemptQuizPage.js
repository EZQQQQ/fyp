// /frontend/src/components/Quiz/AttemptQuizPage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function AttemptQuizPage() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  // For each question, store selectedOptionId as an array (if multiple choice) or a single value (if single choice)
  const [answers, setAnswers] = useState([]);
  // Current question index for one-by-one display
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Fetch quiz details and initialize answers
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(quizId);
        if (!res.success) {
          throw new Error(res.message || "Failed to load quiz");
        }
        const fetchedQuiz = res.quiz;
        setQuiz(fetchedQuiz);
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

  // Prevent external navigation (refresh/close) using beforeunload event
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      e.preventDefault();
      try {
        await quizService.endQuizAttempt(quizId, attemptId);
      } catch (error) {
        console.error("Error ending quiz attempt:", error);
      }
      e.returnValue = "Are you sure you want to leave? Your progress will be lost.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      quizService.endQuizAttempt(quizId, attemptId).catch((error) => {
        console.error("Error ending quiz attempt:", error);
      });
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizId, attemptId]);

  // Custom popstate handler for browser back button (internal navigation)
  useEffect(() => {
    // Push an extra history state so that popstate is triggered when user clicks the back button.
    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = (e) => {
      const confirmLeave = window.confirm("Are you sure you want to leave? Your progress will be lost.");
      if (!confirmLeave) {
        // Re-push state to cancel navigation.
        window.history.pushState(null, document.title, window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleOptionChange = (qIdx, optionId) => {
    setAnswers((prev) =>
      prev.map((ans, idx) => {
        if (idx !== qIdx) return ans;
        const question = quiz.questions[qIdx];
        if (question.allowMultipleCorrect) {
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
          return { ...ans, selectedOptionId: optionId };
        }
      })
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Modified handleSubmit: check if all questions are answered.
  const handleSubmit = async () => {
    // Check if any question is unanswered.
    const incomplete = answers.some((ans) =>
      Array.isArray(ans.selectedOptionId)
        ? ans.selectedOptionId.length === 0
        : ans.selectedOptionId === null
    );

    if (incomplete) {
      const confirmSubmit = window.confirm(
        "You have not attempted all the questions, are you sure you want to submit?"
      );
      if (!confirmSubmit) return;
    }

    try {
      const attemptData = { answers };
      const res = await quizService.submitQuizAttempt(quizId, attemptId, attemptData);
      if (res.quizAttempt) {
        toast.success(`Quiz submitted! Score: ${res.quizAttempt.score}`);
        navigate(`/communities/${quiz.community}`);
      } else {
        toast.success("Quiz submitted!");
        navigate(`/communities/${quiz.community}`);
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit quiz");
    }
  };

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

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">{quiz.title}</h2>
      <div className="mb-6">
        <p className="font-medium text-lg mb-2">
          {currentQuestionIndex + 1}. {currentQuestion.questionText}
        </p>
        <div className="space-y-2">
          {currentQuestion.options.map((opt) => {
            const selected = currentQuestion.allowMultipleCorrect
              ? answers[currentQuestionIndex]?.selectedOptionId.includes(opt._id)
              : answers[currentQuestionIndex]?.selectedOptionId === opt._id;
            return (
              <label key={opt._id} className="flex items-center cursor-pointer">
                <input
                  type={currentQuestion.allowMultipleCorrect ? "checkbox" : "radio"}
                  className="mr-2"
                  checked={!!selected}
                  onChange={() => handleOptionChange(currentQuestionIndex, opt._id)}
                />
                <span className="text-gray-700 dark:text-gray-300">{opt.optionText}</span>
              </label>
            );
          })}
        </div>
      </div>
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mt-8">
        {/* Left side: Always visible arrow buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-3 py-2 rounded-full ${currentQuestionIndex === 0
              ? "bg-blue-100 text-blue-400 cursor-not-allowed"
              : "bg-blue-200 text-blue-800 hover:bg-blue-300 focus:outline-none focus:ring focus:ring-blue-400"
              }`}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentQuestionIndex === quiz.questions.length - 1}
            className={`px-3 py-2 rounded-full ${currentQuestionIndex === quiz.questions.length - 1
              ? "bg-blue-100 text-blue-400 cursor-not-allowed"
              : "bg-blue-200 text-blue-800 hover:bg-blue-300 focus:outline-none focus:ring focus:ring-blue-400"
              }`}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </Button>
        </div>
        {/* Right side: Submit button always visible */}
        <div>
          <Button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-200 text-blue-800 hover:bg-blue-300 focus:outline-none focus:ring focus:ring-blue-400"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AttemptQuizPage;
