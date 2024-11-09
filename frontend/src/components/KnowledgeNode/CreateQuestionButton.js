// /frontend/src/components/KnowledgeNode/CreateQuestionButton.js

import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/solid"; // Ensure you have Heroicons installed or use another icon library

function CreateQuestionButton({ communityId }) {
  return (
    <Link
      to={`/add-question?community=${communityId}`}
      className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      Create Question
    </Link>
  );
}

export default CreateQuestionButton; // Ensure default export
