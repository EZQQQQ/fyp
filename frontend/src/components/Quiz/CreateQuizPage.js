// /frontend/src/components/Quiz/CreateQuizPage.js

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";

import quizService from "../../services/quizService";

function CreateQuizPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);

  // Add an empty question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        allowMultipleCorrect: false,
        options: [{ optionText: "", isCorrect: false }],
      },
    ]);
  };

  // Add an empty option to a specific question
  const handleAddOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push({ optionText: "", isCorrect: false });
    setQuestions(updated);
  };

  // Validate that each question has at least 1 correct answer
  const validateQuiz = () => {
    // 1) Check quiz title
    if (!title.trim()) {
      toast.error("Quiz title cannot be empty.");
      return false;
    }

    // 2) Check each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      // Make sure question text isn't empty
      if (!question.questionText.trim()) {
        toast.error(`Question #${i + 1} has empty text.`);
        return false;
      }

      // Ensure at least one option is correct
      const hasCorrect = question.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        toast.error(`Question #${i + 1} must have at least one correct answer.`);
        return false;
      }
    }

    return true; // If we pass all checks, the quiz is valid
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Perform validation
    if (!validateQuiz()) {
      return; // stop if validation fails
    }

    try {
      const quizData = { title, questions };
      await quizService.createQuiz(communityId, quizData);
      toast.success("Quiz created!");

      // Navigate back to the community page
      navigate(`/communities/${communityId}`);
    } catch (err) {
      console.error("Error creating quiz:", err);
      toast.error("Failed to create quiz");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Create a New Quiz</h2>

      {/* Title */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Quiz Title</label>
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="Enter quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Questions */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Questions</label>
        {questions.map((question, qIdx) => (
          <div key={qIdx} className="border rounded p-2 mb-2">
            {/* Question Text */}
            <input
              type="text"
              className="border p-1 w-full mb-2"
              placeholder="Enter question text"
              value={question.questionText}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIdx].questionText = e.target.value;
                setQuestions(updated);
              }}
            />

            {/* Allow Multiple Correct */}
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={question.allowMultipleCorrect}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIdx].allowMultipleCorrect = e.target.checked;
                  setQuestions(updated);
                }}
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
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIdx].options[optIdx].optionText = e.target.value;
                      setQuestions(updated);
                    }}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={opt.isCorrect}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx].options[optIdx].isCorrect =
                          e.target.checked;
                        setQuestions(updated);
                      }}
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

      {/* Submit Button */}
      <Button color="blue" onClick={handleSubmit}>
        Create Quiz
      </Button>
    </div>
  );
}

export default CreateQuizPage;
