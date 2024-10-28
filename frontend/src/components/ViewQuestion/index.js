// /frontend/src/components/ViewQuestion/index.js

import React from "react";
import MainQuestion from "./MainQuestion";
import Sidebar from "../KnowledgeNode/Sidebar";

function ViewQuestion() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-4 shadow-md" />

      {/* Main Content */}
      <MainQuestion className="w-full md:w-3/4 p-4" />
    </div>
  );
}

export default ViewQuestion;
