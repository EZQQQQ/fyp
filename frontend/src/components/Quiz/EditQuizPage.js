// /frontend/src/components/Quiz/EditQuizPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import TextContent from "../ViewQuestion/TextContent"; // Import TextContent

function EditQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch quiz data on component mount.
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(quizId);
        if (!res.success) {
          throw new Error(res.message || "Failed to load quiz");
        }
        // Set the quiz data (which includes title, instructions, and questions)
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

  // Handler for changing the quiz title.
  const handleTitleChange = (e) => {
    setQuiz((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  // Handler for updating the instructions (using MarkdownEditor).
  const handleInstructionsChange = (value) => {
    setQuiz((prev) => ({
      ...prev,
      instructions: value,
    }));
  };

  // Handler for updating a field in a specific question.
  const handleQuestionChange = (qIndex, field, value) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex][field] = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Handler for adding a new question.
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

  // Handler for removing a question.
  const handleRemoveQuestion = (qIndex) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIndex),
    }));
  };

  // Handler for adding an option to a question.
  const handleAddOption = (qIndex) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options.push({ optionText: "", isCorrect: false });
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Handler for updating an option's field.
  const handleOptionChange = (qIndex, optIndex, field, value) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options[optIndex][field] = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Validate that the quiz has a title, instructions, and that each question has text and at least one correct option.
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

  // Handle saving the updated quiz.
  const handleSave = async () => {
    const updatedQuizData = {
      title: quiz.title,
      instructions: quiz.instructions,
      questions: quiz.questions,
    };

    if (!validateQuiz(updatedQuizData)) {
      return;
    }

    try {
      const res = await quizService.updateQuiz(quizId, updatedQuizData);
      if (!res.success) {
        throw new Error(res.message || "Failed to update quiz");
      }
      toast.success("Quiz updated successfully!");
      // Navigate back (for example, to the community page or quiz list)
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
          className="border p-2 w-full"
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

        {/* Preview rendered instructions */}
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Instructions Preview:</h3>
          <TextContent content={quiz.instructions} type="html" />
        </div>
      </div>

      {/* Questions */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Questions</label>
        {quiz.questions.map((question, qIdx) => (
          <div key={qIdx} className="relative border rounded p-2 mb-2">
            {/* Remove Question Button */}
            <button
              onClick={() => handleRemoveQuestion(qIdx)}
              className="absolute top-2 right-2 text-sm text-red-500 hover:text-red-700 focus:outline-none"
              title="Remove Question"
            >
              &#x2715;
            </button>

            {/* Question Text using MarkdownEditor */}
            <label className="block font-medium mb-1">Question Text</label>
            <MarkdownEditor
              value={question.questionText}
              onChange={(value) => handleQuestionChange(qIdx, "questionText", value)}
              placeholder="Enter question text"
            />

            {/* Explanation (optional) */}
            <label className="block font-medium mb-1 mt-2">Explanation (optional)</label>
            <textarea
              className="border p-2 w-full h-24"
              placeholder="Enter explanation for this question (optional)"
              value={question.explanation}
              onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
            ></textarea>

            {/* Allow Multiple Correct */}
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

            {/* Options */}
            <div className="ml-4 mt-2">
              {question.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="border p-1 mr-2 flex-1"
                    placeholder="Enter option text"
                    value={opt.optionText}
                    onChange={(e) => handleOptionChange(qIdx, optIdx, "optionText", e.target.value)}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={opt.isCorrect}
                      onChange={(e) => handleOptionChange(qIdx, optIdx, "isCorrect", e.target.checked)}
                    />
                    Correct
                  </label>
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
