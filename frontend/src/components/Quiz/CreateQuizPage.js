// /frontend/src/components/Quiz/CreateQuizPage.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";

import quizService from "../../services/quizService";
import { createAssessmentTask } from "../../features/assessmentSlice";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import TextContent from "../ViewQuestion/TextContent"; // Import TextContent for preview

function CreateQuizPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State for quiz title, questions, and instructions.
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [instructions, setInstructions] = useState(
    `After you have completed the online lesson, complete this assessment quiz that tests your knowledge of the content covered in the online lesson.

Note:
1) You will not be able to attempt the quiz after the due date and will not get any scores for this quiz.
2) You are required to complete the entire quiz in a single session once you have started it. Please do not attempt the quiz from more than one browser window/tab or device as the second access would be considered a re-attempt.

INSTRUCTIONS
Description:
This MCQ is based on the lecture content.
Instructions:
Complete all {number} questions.
Force Completion: Once started, this test must be completed in one sitting. Do not leave the test before clicking Save and Submit.
Due Date: This Test is due on {time set by professor}. Test submitted past this date will not be recorded.`
  );

  // Add an empty question including an explanation field.
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "", // Markdown content for the question text.
        explanation: "",  // Plain text explanation (optional)
        allowMultipleCorrect: false,
        options: [{ optionText: "", isCorrect: false }],
      },
    ]);
  };

  // Remove a question at a given index.
  const handleRemoveQuestion = (qIdx) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  // Add an empty option to a specific question.
  const handleAddOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push({ optionText: "", isCorrect: false });
    setQuestions(updated);
  };

  // Validate that each question has at least one correct answer and that required fields are filled.
  const validateQuiz = () => {
    if (!title.trim()) {
      toast.error("Quiz title cannot be empty.");
      return false;
    }
    if (!instructions.trim()) {
      toast.error("Quiz instructions cannot be empty.");
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.questionText.trim()) {
        toast.error(`Question #${i + 1} has empty text.`);
        return false;
      }
      const hasCorrect = question.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        toast.error(`Question #${i + 1} must have at least one correct answer.`);
        return false;
      }
    }
    return true;
  };

  // Handle form submission.
  const handleSubmit = async () => {
    if (!validateQuiz()) {
      return;
    }

    try {
      // Package quiz data including rich text instructions and questions.
      const quizData = { title, instructions, questions };
      console.log("Quiz Data:", quizData);

      const res = await quizService.createQuiz(communityId, quizData);

      if (res.success) {
        toast.success("Quiz created!");

        // Create an associated assessment task automatically.
        const taskData = {
          adminLabel: title,
          label: `Complete quiz ${title}`,
          type: "quizzes",
          total: questions.length, // total possible score based on number of questions
          weight: 0,
          quizId: res.quiz._id,
        };

        await dispatch(createAssessmentTask({ communityId, taskData })).unwrap();
        toast.success("Assessment task for quiz created!");
      }

      // Navigate back to the community page.
      navigate(`/communities/${communityId}`);
    } catch (err) {
      console.error("Error creating quiz:", err);
      toast.error("Failed to create quiz");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Create a New Quiz</h2>

      {/* Quiz Title */}
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

      {/* Quiz Instructions */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Quiz Instructions/Notes</label>
        <MarkdownEditor
          value={instructions}
          onChange={setInstructions}
          placeholder="Enter quiz instructions"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          You can modify these instructions if needed.
        </p>

        {/* Preview the rendered instructions using TextContent */}
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Instructions Preview:</h3>
          <TextContent content={instructions} type="html" />
        </div>
      </div>

      {/* Questions */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Questions</label>
        {questions.map((question, qIdx) => (
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
              onChange={(value) => {
                const updated = [...questions];
                updated[qIdx].questionText = value;
                setQuestions(updated);
              }}
              placeholder="Enter question text"
            />

            {/* Explanation field using a simple textarea */}
            <label className="block font-medium mb-1 mt-2">Explanation (optional)</label>
            <textarea
              className="border p-2 w-full h-24"
              placeholder="Enter explanation for this question (optional)"
              value={question.explanation}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIdx].explanation = e.target.value;
                setQuestions(updated);
              }}
            ></textarea>

            {/* Allow Multiple Correct */}
            <div className="mt-2">
              <label className="flex items-center">
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
                        updated[qIdx].options[optIdx].isCorrect = e.target.checked;
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
