import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message }) => {
  return (
    <li className="chat-message">
      <strong className="chat-message-sender">{message.sender}:</strong>
      <span className="chat-message-content"> {message.content}</span>
    </li>
  );
};

export default ChatMessage;
