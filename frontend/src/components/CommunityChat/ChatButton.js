// frontend/src/components/CommunityChat/ChatButton.js
import React from 'react';
import './ChatButton.css';

const ChatButton = ({ onClick }) => {
  return (
    <button className="Btn" onClick={onClick}>
      <div className="sign">
        <svg viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h7v-2.5c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5V19h7v-2.5c0-2.33-4.67-3.5-7-3.5H8z" />
        </svg>
      </div>
      <div className="text">Chat</div>
    </button>
  );
};

export default ChatButton;
