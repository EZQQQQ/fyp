// frontend/src/components/CommunityChat/ChatIframe.js
// ChatIframe.js
import React from 'react';
import './ChatIframe.css';

const ChatIframe = ({ onMinimize, communityId }) => {
  // URL to contain a :communityId parameter.
  const chatUrl = `/chat/${communityId}`;
  return (
    <div className="chat-iframe-container">
      <iframe
        src={chatUrl}
        title="Community Chat"
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
    </div>
  );
};

export default ChatIframe;
