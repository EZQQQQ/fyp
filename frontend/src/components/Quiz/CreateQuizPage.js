// frontend/src/components/Quiz/CreateQuizPage.js
import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import quizService from "../../services/quizService";
import { createAssessmentTask } from "../../features/assessmentSlice";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import TextContent from "../ViewQuestion/TextContent";

function CreateQuizPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Pre-populate state with generated quiz if available
  const initialQuizData = location.state?.quizData;
  const [title, setTitle] = useState(initialQuizData?.title || "");
  const [questions, setQuestions] = useState(initialQuizData?.questions || []);
  const [instructions, setInstructions] = useState(
    initialQuizData?.instructions ||
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

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        explanation: "",
        allowMultipleCorrect: false,
        options: [{ optionText: "", isCorrect: false }],
      },
    ]);
  };

  const handleRemoveQuestion = (qIdx) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  const handleAddOption = (qIdx) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].options.push({ optionText: "", isCorrect: false });
      return updated;
    });
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].options = updated[qIdx].options.filter(
        (_, idx) => idx !== optIdx
      );
      return updated;
    });
  };

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

  const handleSubmit = async () => {
    if (!validateQuiz()) return;

    try {
      const quizDataToSend = { title, instructions, questions };
      // console.log("Quiz Data:", quizDataToSend);

      const res = await quizService.createQuiz(communityId, quizDataToSend);

      if (res.success) {
        toast.success("Quiz created!");

        // Create an associated assessment task automatically.
        const taskData = {
          adminLabel: title,
          label: `Complete quiz ${title}`,
          type: "quizzes",
          total: questions.length,
          weight: 0,
          quizId: res.quiz._id,
        };

        await dispatch(createAssessmentTask({ communityId, taskData })).unwrap();
        toast.success("Assessment task for quiz created!");
      }

      navigate(`/communities/${communityId}`);
    } catch (err) {
      console.error("Error creating quiz:", err);
      toast.error("Failed to create quiz");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create a New Quiz</h2>
        <Button
          color="blue"
          className="text-sm px-3 py-2"
          onClick={() => navigate(`/communities/${communityId}/create-quiz/ai`)}
        >
          <AutoAwesomeIcon className="mr-2" />
          Create Quiz with AI
        </Button>
      </div>

      {/* Quiz Title */}
      <div className="mb-4">
        <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Quiz Title</label>
        <input
          type="text"
          className="border border-gray-300 dark:border-gray-600 p-2 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Enter quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Quiz Instructions */}
      <div className="mb-4">
        <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Quiz Instructions/Notes</label>
        <MarkdownEditor
          value={instructions}
          onChange={setInstructions}
          placeholder="Enter quiz instructions"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          You can modify these instructions if needed.
        </p>
        <div className="mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-2">Instructions Preview:</h3>
          <TextContent
            content={instructions}
            type="html"
            className="text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="mb-4">
        <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Questions</label>
        {questions.map((question, qIdx) => (
          <div key={qIdx} className="relative border border-gray-300 dark:border-gray-600 rounded p-2 mb-2">
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
              onChange={(value) => {
                const updated = [...questions];
                updated[qIdx].questionText = value;
                setQuestions(updated);
              }}
              placeholder="Enter question text"
            />
            <label className="block font-medium mb-1 mt-2">Explanation (optional)</label>
            <textarea
              className="border border-gray-300 dark:border-gray-600 p-2 w-full h-24 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter explanation for this question (optional)"
              value={question.explanation}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIdx].explanation = e.target.value;
                setQuestions(updated);
              }}
            ></textarea>
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
            <div className="ml-4 mt-2">
              {question.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="border border-gray-300 dark:border-gray-600 p-1 mr-2 flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Enter option text"
                    value={opt.optionText}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIdx].options[optIdx].optionText = e.target.value;
                      setQuestions(updated);
                    }}
                  />
                  <label className="flex items-center mr-2">
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

      {/* Submit Button */}
      <Button color="blue" onClick={handleSubmit}>
        Create Quiz
      </Button>
    </div>
  );
}

export default CreateQuizPage;
