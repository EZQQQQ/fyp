// /frontend/src/components/Modal/CustomDialog.js

import React from "react";

const sizeClasses = {
  xs: "w-1/4",
  sm: "w-1/3",
  md: "w-2/5",
  lg: "w-3/5",
  xl: "w-3/4",
  xxl: "w-full h-full",
};

function CustomDialog({ isOpen, onClose, size = "md", children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${sizeClasses[size]} 
        w-full max-w-lg mx-auto my-4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 
        transition-transform duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default CustomDialog;
