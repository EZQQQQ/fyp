// /frontend/src/components/KnowledgeNode/FilterButton.js

import React from "react";
import PropTypes from "prop-types";

function FilterButton({ label, active, onClick, rounded }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium ${
        active
          ? "bg-blue-500 text-white"
          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
      } border border-gray-300 dark:border-gray-600 hover:bg-blue-500 hover:text-white transition-colors duration-200 ${rounded}`}
    >
      {label}
    </button>
  );
}

FilterButton.propTypes = {
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  rounded: PropTypes.string, // e.g., "rounded-l-md", "rounded-r-md"
};

FilterButton.defaultProps = {
  rounded: "",
};

export default FilterButton;
