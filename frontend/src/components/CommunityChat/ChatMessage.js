// frontend/src/components/CommunityChat/ChatMessage.js
import React from 'react';

const ChatMessage = ({ message }) => {
  return (
    <li className="p-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
      <strong>{message.sender}: </strong>
      <span>{message.content}</span>
    </li>
  );
};

export default ChatMessage;
