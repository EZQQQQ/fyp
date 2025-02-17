import React from "react";
import PropTypes from "prop-types";

function AssessmentTasks({ tasks }) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No assessment tasks available.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* List of tasks */}
      {tasks.map((task) => {
        const { _id, label, total, studentProgress, type } = task;

        const percentage =
          type === "quizzes"
            ? studentProgress
            : total
              ? Math.min((studentProgress / total) * 100, 100)
              : 0;

        const labelWithoutWeight = label.replace(/\(\d+%\)/g, "").trim();

        // console.log(`Task ${_id} of type ${type}: studentProgress=${studentProgress}, total=${total}`);

        return (
          <div key={_id} className="mb-6">
            {/* Task Label and Percentage */}
            <div className="flex justify-between mb-1">
              <span className="text-base font-small text-black dark:text-white">
                {labelWithoutWeight}
              </span>
              <span className="text-sm font-small text-black dark:text-white">
                {Math.round(percentage)}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

AssessmentTasks.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
      studentProgress: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default AssessmentTasks;

