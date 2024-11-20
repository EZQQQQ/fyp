// frontend/src/components/Community/AssessmentTasks.js

import React from "react";
import { Typography } from "@material-tailwind/react";

function AssessmentTasks({ tasks }) {
  return (
    <div>
      <Typography
        variant="h6"
        className="text-gray-900 dark:text-gray-100 mb-2"
      >
        Your Assessment
      </Typography>
      <ul className="space-y-2">
        {tasks && Object.keys(tasks).length > 0 ? (
          Object.entries(tasks).map(([taskName, details]) => (
            <li
              key={taskName}
              className="flex justify-between items-center bg-white dark:bg-gray-700 p-2 rounded shadow"
            >
              <span className="text-gray-800 dark:text-gray-200">
                {taskName}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {details.completed} / {details.required}
              </span>
            </li>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No assessment tasks assigned.
          </p>
        )}
      </ul>
    </div>
  );
}

export default AssessmentTasks;
