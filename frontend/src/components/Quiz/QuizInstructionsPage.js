// /frontend/src/components/Quiz/QuizInstructionsPage.js

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import quizService from "../../services/quizService";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";

function QuizInstructionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Handle the Begin action
  const handleBegin = async () => {
    try {
      // Register the quiz attempt session
      const res = await quizService.startQuizAttempt(quizId);
      if (!res.success) {
        throw new Error(res.message || "Failed to start quiz attempt");
      }

      const { attemptId } = res;

      // Navigate to the Attempt Quiz Page with the attemptId
      navigate(`/quiz/${quizId}/attempt/${attemptId}`);
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      toast.error(error.message || "Failed to start quiz attempt");
    }
  };

  // Handle the Cancel action
  const handleCancel = () => {
    navigate(-1); // Go back to the previous page (Community Page)
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Description</h3>
          <p>This MCQ is based on the content for this module.</p>
        </div>
        <div>
          <h3 className="font-medium">Instructions</h3>
          <ul className="list-disc list-inside">
            <li>Complete all 5 questions.</li>
            <li>
              Force Completion: Once started, this test must be completed in one sitting.
              Do not leave the test before clicking Save and Submit.
            </li>
            <li>
              Due Date: This Test is due on February 14, 2025 11:59:00 PM SGT.
              Test cannot be started past this date.
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button color="red" onClick={handleCancel}>
          Cancel
        </Button>
        <Button color="green" onClick={handleBegin}>
          Begin
        </Button>
      </div>
    </div>
  );
}

export default QuizInstructionsPage;
