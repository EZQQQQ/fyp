// frontend/src/components/CommunityChat/ChatIframeHeader.js
import React from 'react';
import './ChatIframeHeader.css';

const ChatIframeHeader = ({ onMinimize, title = "Community Chat" }) => {
  return (
    <div className="chat-iframe-header">
      <span className="chat-iframe-title">{title}</span>
      <button className="chat-iframe-minimize-button" onClick={onMinimize}>
        –
      </button>
    </div>
  );
};

export default ChatIframeHeader;
