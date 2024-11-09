// frontend/src/components/KnowledgeNode/FilterButton.js

import React from "react";
import PropTypes from "prop-types";

function FilterButton({ label, active, onClick, rounded }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-4 py-2 text-sm font-medium ${
        active
          ? "bg-blue-500 text-white"
          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
      } border border-gray-300 dark:border-gray-600 ${
        rounded || ""
      } focus:outline-none flex items-center justify-center`}
    >
      {label}
    </button>
  );
}

FilterButton.propTypes = {
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  rounded: PropTypes.string,
};

export default FilterButton;
