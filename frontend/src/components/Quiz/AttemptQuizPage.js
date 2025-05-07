// frontend/src/components/Quiz/AttemptQuizPage.js

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
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ----------------------------
  // Navigation Blocking Logic
  // ----------------------------
  const blocker = useBlocker(!quizCompleted);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!quizCompleted) {
          event.preventDefault();
          event.returnValue = ""; // triggers browser dialog
        }
      },
      [quizCompleted]
    )
  );

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
  }, [blocker]);

  // ----------------------------
  // Fetch Quiz Data
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
        setAnswers(
          fetchedQuiz.questions.map((q) => ({
            questionId: q._id,
            selectedOptionId: q.allowMultipleCorrect ? [] : null,
          }))
        );
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
          const already = ans.selectedOptionId.includes(optionId);
          return {
            ...ans,
            selectedOptionId: already
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
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    // 1) Always warn about no reattempts
    const confirmFinal = window.confirm(
      "You are about to submit the quiz, there will be no reattempts after this."
    );
    if (!confirmFinal) return;

    // 2) If some unanswered, warn again
    const incomplete = answers.some((ans) =>
      Array.isArray(ans.selectedOptionId)
        ? ans.selectedOptionId.length === 0
        : ans.selectedOptionId === null
    );
    if (incomplete) {
      const confirmIncomplete = window.confirm(
        "You have not attempted all the questions, are you sure you want to submit?"
      );
      if (!confirmIncomplete) return;
    }

    try {
      const attemptData = { answers };
      const res = await quizService.submitQuizAttempt(
        quizId,
        attemptId,
        attemptData
      );
      if (res.quizAttempt) {
        toast.success(`Quiz submitted! Score: ${res.quizAttempt.score}`);
      } else {
        toast.success("Quiz submitted!");
      }
      // flip the flag — navigation blocker will now allow redirect
      setQuizCompleted(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit quiz");
    }
  };

  // once quizCompleted is true, fire the actual redirect
  useEffect(() => {
    if (quizCompleted && quiz) {
      navigate(`/communities/${quiz.community}`);
    }
  }, [quizCompleted, quiz, navigate]);

  // ----------------------------
  // Render
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
        <div className="font-medium text-lg mb-2">
          <span>{currentQuestionIndex + 1}. </span>
          <TextContent content={currentQuestion.questionText} type="html" />
        </div>
        <div className="space-y-2">
          {currentQuestion.options.map((opt) => {
            const selected = currentQuestion.allowMultipleCorrect
              ? answers[currentQuestionIndex].selectedOptionId.includes(opt._id)
              : answers[currentQuestionIndex].selectedOptionId === opt._id;
            return (
              <label key={opt._id} className="flex items-center cursor-pointer">
                <input
                  type={currentQuestion.allowMultipleCorrect ? "checkbox" : "radio"}
                  className="mr-2"
                  checked={!!selected}
                  onChange={() =>
                    handleOptionChange(currentQuestionIndex, opt._id)
                  }
                />
                <TextContent content={opt.optionText} type="html" />
              </label>
            );
          })}
        </div>
      </div>
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
