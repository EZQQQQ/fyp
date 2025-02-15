// frontend/src/components/KnowledgeNode/FilterDropdown.js

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

function FilterDropdown({ options, selected, onSelect, buttonClassName, optionClassName }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setOpen((prev) => !prev);

  const handleSelect = (option) => {
    onSelect(option);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`h-10 ${buttonClassName}  rounded-md focus:outline-none flex items-center justify-center`}
      >
        {selected.label}
        <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`w-full text-left ${optionClassName} hover:bg-gray-100 dark:hover:bg-gray-600`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

FilterDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ).isRequired,
  selected: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  buttonClassName: PropTypes.string,
  optionClassName: PropTypes.string,
};

export default FilterDropdown;

