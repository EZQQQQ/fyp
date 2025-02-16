// /frontend/src/components/Quiz/EditQuizPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import TextContent from "../ViewQuestion/TextContent"; // For instructions preview

function EditQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch quiz data on mount.
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(quizId);
        if (!res.success) {
          throw new Error(res.message || "Failed to load quiz");
        }
        setQuiz(res.quiz);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        toast.error(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleTitleChange = (e) => {
    setQuiz((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleInstructionsChange = (value) => {
    setQuiz((prev) => ({ ...prev, instructions: value }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex][field] = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          explanation: "",
          allowMultipleCorrect: false,
          options: [{ optionText: "", isCorrect: false }],
        },
      ],
    }));
  };

  const handleRemoveQuestion = (qIndex) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIndex),
    }));
  };

  const handleAddOption = (qIndex) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options.push({ optionText: "", isCorrect: false });
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Fix: Use qIndex instead of qIdx in the filter.
  const handleRemoveOption = (qIndex, optIndex) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter(
        (_, index) => index !== optIndex
      );
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (qIndex, optIndex, field, value) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options[optIndex][field] = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  const validateQuiz = (quizData) => {
    if (!quizData.title.trim()) {
      toast.error("Quiz title cannot be empty.");
      return false;
    }
    if (!quizData.instructions.trim()) {
      toast.error("Quiz instructions cannot be empty.");
      return false;
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question #${i + 1} text is empty.`);
        return false;
      }
      const hasCorrect = q.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        toast.error(`Question #${i + 1} must have at least one correct answer.`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    const updatedQuizData = {
      title: quiz.title,
      instructions: quiz.instructions,
      questions: quiz.questions,
    };

    if (!validateQuiz(updatedQuizData)) return;

    try {
      const res = await quizService.updateQuiz(quizId, updatedQuizData);
      if (!res.success) {
        throw new Error(res.message || "Failed to update quiz");
      }
      toast.success("Quiz updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error updating quiz:", err);
      toast.error(err.message || "Failed to update quiz");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading quiz data...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500">Quiz not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Edit Quiz</h2>

      {/* Quiz Title */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Quiz Title</label>
        <input
          type="text"
          className="border border-gray-300 dark:border-gray-600 p-2 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={quiz.title}
          onChange={handleTitleChange}
        />
      </div>

      {/* Quiz Instructions */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Quiz Instructions/Notes</label>
        <MarkdownEditor
          value={quiz.instructions}
          onChange={handleInstructionsChange}
          placeholder="Enter quiz instructions"
        />
        {/* Instructions Preview */}
        <div className="mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Instructions Preview:
          </h3>
          <TextContent
            content={quiz.instructions}
            type="html"
            className="text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Questions</label>
        {quiz.questions.map((question, qIdx) => (
          <div key={qIdx} className="relative border border-gray-300 dark:border-gray-600 rounded p-2 mb-2">
            {/* Remove Question Button */}
            <button
              onClick={() => handleRemoveQuestion(qIdx)}
              className="absolute top-2 right-2 text-sm text-red-500 hover:text-red-700 focus:outline-none"
              title="Remove Question"
            >
              &#x2715;
            </button>
            <label className="block font-medium mb-1">Question Text</label>
            <MarkdownEditor
              value={question.questionText}
              onChange={(value) => handleQuestionChange(qIdx, "questionText", value)}
              placeholder="Enter question text"
            />
            <label className="block font-medium mb-1 mt-2">Explanation (optional)</label>
            <textarea
              className="border border-gray-300 dark:border-gray-600 p-2 w-full h-24 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter explanation for this question (optional)"
              value={question.explanation}
              onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
            ></textarea>
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={question.allowMultipleCorrect}
                  onChange={(e) => handleQuestionChange(qIdx, "allowMultipleCorrect", e.target.checked)}
                />
                Allow multiple correct answers?
              </label>
            </div>
            <div className="ml-4 mt-2">
              {question.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="border border-gray-300 dark:border-gray-600 p-1 mr-2 flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Enter option text"
                    value={opt.optionText}
                    onChange={(e) => handleOptionChange(qIdx, optIdx, "optionText", e.target.value)}
                  />
                  <label className="flex items-center mr-2">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={opt.isCorrect}
                      onChange={(e) => handleOptionChange(qIdx, optIdx, "isCorrect", e.target.checked)}
                    />
                    Correct
                  </label>
                  <button
                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                    className="text-red-500 hover:text-red-700 text-lg focus:outline-none"
                    title="Remove Option"
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                color="blue"
                variant="outlined"
                onClick={() => handleAddOption(qIdx)}
              >
                + Add Option
              </Button>
            </div>
          </div>
        ))}
        <Button
          size="sm"
          color="blue"
          variant="outlined"
          onClick={handleAddQuestion}
        >
          + Add Question
        </Button>
      </div>

      {/* Save Changes Button */}
      <Button color="blue" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}

export default EditQuizPage;
