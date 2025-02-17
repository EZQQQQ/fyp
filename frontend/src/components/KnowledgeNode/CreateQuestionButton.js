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
  const linkTo = `/add-question${effectiveCommunityId ? `?community=${effectiveCommunityId}` : ""}`;

  return (
    <>
      {/* Full button for medium and larger screens */}
      <Link
        to={linkTo}
        className={`hidden sm:flex h-10 items-center bg-blue-500 text-white px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-blue-600 transition-colors duration-200 ${className}`}
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        <span>Create Question</span>
      </Link>

      {/* Compact icon-only button for small screens */}
      <Link
        to={linkTo}
        className={`flex sm:hidden h-10 w-10 items-center justify-center rounded-full hover:bg-blue-600 transition-colors duration-200 ${className}`}
        title="Create Question"
      >
        <PlusIcon className="h-5 w-5" />
      </Link>
    </>
  );
}

CreateQuestionButton.propTypes = {
  communityId: PropTypes.string,
  className: PropTypes.string,
};

export default CreateQuestionButton;
