// Modal/CommunitySelectModal.js

import React from "react";

function CommunitySelectModal({ communities, onClose, onSelect }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 md:w-1/3">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Select Community
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        <div className="p-4">
          <ul>
            <li>
              <button
                type="button"
                onClick={() => onSelect("all")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                All Communities
              </button>
            </li>
            {communities.map((community) => (
              <li key={community._id}>
                <button
                  type="button"
                  onClick={() => onSelect(community._id)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {community.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CommunitySelectModal;
