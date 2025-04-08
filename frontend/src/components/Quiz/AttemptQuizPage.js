// /frontend/src/components/Quiz/AttemptQuizPage.js

import React, { useEffect, useState, useCallback } from "react";
import {
  useParams,
  useNavigate,
  useBlocker,
  useBeforeUnload,
} from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TextContent from "../ViewQuestion/TextContent";

function AttemptQuizPage() {
  // Local state to track whether the quiz has been submitted.
  const [quizCompleted, setQuizCompleted] = useState(false);

  // React Router hooks:
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  // Other component state
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  // For each question, store the user's selected option(s)
  const [answers, setAnswers] = useState([]);
  // Track the current question index being viewed.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ----------------------------
  // Navigation Blocking Logic
  // ----------------------------

  // useBlocker will intercept internal navigation if the quiz is not yet completed.
  const blocker = useBlocker(!quizCompleted);

  // useBeforeUnload warns on page refresh, closing the tab, or manually entering another URL.
  useBeforeUnload(
    useCallback(
      (event) => {
        if (!quizCompleted) {
          event.preventDefault();
          event.returnValue = ""; // This triggers the browser's default confirmation dialog.
        }
      },
      [quizCompleted]
    )
  );

  // When internal navigation is blocked (blocker.state becomes "blocked"),
  // display a confirmation dialog. If the user confirms, allow navigation.
  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "You have not submitted your quiz yet. Are you sure you want to leave this page?"
      );
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker.state, blocker]);

  // ----------------------------
  // Quiz Data Loading
  // ----------------------------

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

  // ----------------------------
  // Handlers
  // ----------------------------

  const handleOptionChange = (qIdx, optionId) => {
    setAnswers((prev) =>
      prev.map((ans, idx) => {
        if (idx !== qIdx) return ans;
        const question = quiz.questions[qIdx];
        if (question.allowMultipleCorrect) {
          const alreadySelected = ans.selectedOptionId.includes(optionId);
          return {
            ...ans,
            selectedOptionId: alreadySelected
              ? ans.selectedOptionId.filter((id) => id !== optionId)
              : [...ans.selectedOptionId, optionId],
          };
        } else {
          return { ...ans, selectedOptionId: optionId };
        }
      })
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // On submission, check if all questions were answered.
  // If so, submit the quiz, mark it as completed, and navigate away.
  const handleSubmit = async () => {
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
      } else {
        toast.success("Quiz submitted!");
      }
      // Mark quiz as completed so the navigation blocker is disabled.
      setQuizCompleted(true);
      // Navigate away (this will now work since quizCompleted is true)
      navigate(`/communities/${quiz.community}`);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit quiz");
    }
  };

  // ----------------------------
  // Rendering
  // ----------------------------

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
        {/* Display the question text */}
        <div className="font-medium text-lg mb-2">
          <span>{currentQuestionIndex + 1}. </span>
          <TextContent content={currentQuestion.questionText} type="html" />
        </div>
        <div className="space-y-2">
          {currentQuestion.options.map((opt) => {
            const selected =
              currentQuestion.allowMultipleCorrect
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
                <TextContent content={opt.optionText} type="html" />
              </label>
            );
          })}
        </div>
      </div>
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mt-8">
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
        <Button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-blue-200 text-blue-800 hover:bg-blue-300 focus:outline-none focus:ring focus:ring-blue-400"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default AttemptQuizPage;
