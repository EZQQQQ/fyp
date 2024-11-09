// frontend/src/components/KnowledgeNode/CreateQuestionButton.js

import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/solid"; // Ensure you have Heroicons installed or use another icon library
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice"; // Import existing selector

function CreateQuestionButton({ communityId }) {
  const user = useSelector(selectUser);
  const defaultCommunityId = user?.currentCommunityId || "defaultCommunityId"; // Replace with actual default

  const effectiveCommunityId = communityId || defaultCommunityId;

  return (
    <Link
      to={`/add-question${effectiveCommunityId ? `?community=${effectiveCommunityId}` : ""}`}
      className="h-10 flex items-center bg-blue-500 text-white px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-blue-600 transition-colors duration-200"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      Create Question
    </Link>
  );
}

CreateQuestionButton.propTypes = {
  communityId: PropTypes.string, // Optional prop
};

export default CreateQuestionButton;
