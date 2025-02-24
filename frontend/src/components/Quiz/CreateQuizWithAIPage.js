// frontend/src/components/Quiz/CreateQuizWithAIPage.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { toast } from "react-toastify";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import quizService from "../../services/quizService";

function CreateQuizWithAIPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [learningObjective, setLearningObjective] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [numOptions, setNumOptions] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a document.");
      return;
    }
    if (!learningObjective.trim() || !numQuestions.trim() || !numOptions.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("learningObjective", learningObjective);
    formData.append("numQuestions", numQuestions);
    formData.append("numOptions", numOptions);
    formData.append("allowMultiple", allowMultiple);

    setLoading(true);
    try {
      const res = await quizService.createQuizWithAI(communityId, formData);
      if (res.success) {
        toast.success("Quiz generated successfully!");
        // Redirect to manual creation page with generated quiz data
        navigate(`/communities/${communityId}/create-quiz`, { state: { quizData: res.quiz } });
      } else {
        toast.error("Quiz generation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("An error occurred while generating the quiz.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Create Quiz with AI
        </h2>
        <Button
          color="blue"
          className="text-sm px-3 py-2"
          onClick={() => navigate(`/communities/${communityId}/create-quiz`)}
        >
          <PersonOutlineIcon className="mr-2" />
          Create Quiz Manually
        </Button>
      </div>
      <form onSubmit={handleGenerateQuiz}>
        {/* File Upload */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">
            Upload Document (PDF, DOCX, TXT)
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="border border-gray-300 dark:border-gray-600 p-2 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Learning Objective */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">
            Learning Objective
          </label>
          <textarea
            rows={8}
            className="border border-gray-300 dark:border-gray-600 p-2 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            placeholder="Enter the learning objective"
            value={learningObjective}
            onChange={(e) => setLearningObjective(e.target.value)}
          />
        </div>

        {/* Number of Questions */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">
            Number of Questions
          </label>
          <input
            type="number"
            className="border border-gray-300 dark:border-gray-600 p-2 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter the number of questions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
          />
        </div>

        {/* Number of Options */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">
            Number of Options per Question
          </label>
          <input
            type="number"
            className="border border-gray-300 dark:border-gray-600 p-2 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter the number of options"
            value={numOptions}
            onChange={(e) => setNumOptions(e.target.value)}
          />
        </div>

        {/* Allow Multiple Correct Answers */}
        <div className="mb-4">
          <label className="flex items-center text-gray-900 dark:text-gray-100">
            <input
              type="checkbox"
              className="mr-2"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
            />
            Allow Multiple Correct Answers?
          </label>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <Button type="submit" color="blue" disabled={loading}>
            {loading ? "Generating..." : "Generate Quiz"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuizWithAIPage;
