// frontend/src/components/CommunityChat/ChatIframe.js
import React from 'react';
import ChatIframeHeader from './ChatIframeHeader';
import './ChatIframe.css';

const ChatIframe = ({ onMinimize, communityId }) => {
  const chatUrl = `/chat/${communityId}`;
  return (
    <div className="chat-iframe-container">
      <ChatIframeHeader onMinimize={onMinimize} title="Community Chat" />
      <iframe
        src={chatUrl}
        title="Community Chat"
        style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none' }}
      ></iframe>
    </div>
  );
};

export default ChatIframe;
