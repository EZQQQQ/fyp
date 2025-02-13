// frontend/src/components/KnowledgeNode/CreateQuestionButton.js

import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/solid";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";

function CreateQuestionButton({ communityId, className }) {
  const user = useSelector(selectUser);
  const defaultCommunityId = user?.currentCommunityId || "defaultCommunityId";
  const effectiveCommunityId = communityId || defaultCommunityId;

  return (
    <Link
      to={`/add-question${effectiveCommunityId ? `?community=${effectiveCommunityId}` : ""}`}
      className={`h-10 flex items-center bg-blue-500 text-white px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-blue-600 transition-colors duration-200 ${className}`}
    >
      <PlusIcon className="h-4 w-4 mr-1" />
      <span >Create Question</span>
    </Link>
  );
}

CreateQuestionButton.propTypes = {
  communityId: PropTypes.string,
  className: PropTypes.string,
};

export default CreateQuestionButton;

