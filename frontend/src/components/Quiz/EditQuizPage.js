// /frontend/src/components/Quiz/EditQuizPage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";

function EditQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, fetch the quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(quizId);
        if (!res.success) {
          throw new Error(res.message || "Failed to load quiz");
        }

        // The quiz from the server: { title, questions: [...] }
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

  // Handle changing quiz title
  const handleTitleChange = (e) => {
    setQuiz((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  // Add a new question
  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          allowMultipleCorrect: false,
          options: [{ optionText: "", isCorrect: false }],
        },
      ],
    }));
  };

  // Update question text / allowMultipleCorrect
  const handleQuestionChange = (qIndex, field, value) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex][field] = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Add a new option to a question
  const handleAddOption = (qIndex) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options.push({
        optionText: "",
        isCorrect: false,
      });
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Update an option's text or isCorrect
  const handleOptionChange = (qIndex, optIndex, field, value) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options[optIndex][field] = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Validate that each question has at least 1 correct option
  const validateQuiz = (quizData) => {
    if (!quizData.title.trim()) {
      toast.error("Quiz title cannot be empty.");
      return false;
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question #${i + 1} text is empty.`);
        return false;
      }
      // check if at least one correct
      const hasCorrect = q.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        toast.error(`Question #${i + 1} must have at least one correct answer.`);
        return false;
      }
    }
    return true;
  };

  // Submit updated quiz to server
  const handleSave = async () => {
    try {
      const updatedQuizData = { title: quiz.title, questions: quiz.questions };

      // Validate before saving
      if (!validateQuiz(updatedQuizData)) {
        return; // stop if validation fails
      }

      // Send to server
      const res = await quizService.updateQuiz(quizId, updatedQuizData);
      if (!res.success) {
        throw new Error(res.message || "Failed to update quiz");
      }

      toast.success("Quiz updated successfully!");
      // navigate back to e.g. the community page or quiz listing
      navigate(-1);
    } catch (err) {
      console.error("Error updating quiz:", err);
      toast.error(err.message || "Failed to update quiz");
    }
  };

  if (loading) return <p>Loading quiz data...</p>;
  if (!quiz) return <p>Quiz not found.</p>;

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

      {/* Questions */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Questions</label>
        {quiz.questions.map((question, qIdx) => (
          <div key={qIdx} className="border rounded p-2 mb-2">
            {/* Question Text */}
            <input
              type="text"
              className="border p-1 w-full mb-2"
              placeholder="Enter question text"
              value={question.questionText}
              onChange={(e) =>
                handleQuestionChange(qIdx, "questionText", e.target.value)
              }
            />

            {/* Allow multiple correct? */}
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={question.allowMultipleCorrect}
                onChange={(e) =>
                  handleQuestionChange(qIdx, "allowMultipleCorrect", e.target.checked)
                }
              />
              Allow multiple correct answers?
            </label>

            {/* Options */}
            <div className="ml-4">
              {question.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="border p-1 mr-2 flex-1"
                    placeholder="Option text"
                    value={opt.optionText}
                    onChange={(e) =>
                      handleOptionChange(qIdx, optIdx, "optionText", e.target.value)
                    }
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={opt.isCorrect}
                      onChange={(e) =>
                        handleOptionChange(qIdx, optIdx, "isCorrect", e.target.checked)
                      }
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
        <Button size="sm" color="blue" variant="outlined" onClick={handleAddQuestion}>
          + Add Question
        </Button>
      </div>

      {/* Save Button */}
      <Button color="blue" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}

export default EditQuizPage;
