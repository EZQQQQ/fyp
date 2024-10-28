// /frontend/src/components/KnowledgeNode/FilterButton.js

import React from "react";

function FilterButton({ label, active, onClick, rounded }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium focus:outline-none ${
        active
          ? "bg-blue-500 text-white"
          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      } ${rounded} transition-colors duration-200`}
    >
      {label}
    </button>
  );
}

export default FilterButton;
