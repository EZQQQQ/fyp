// frontend/src/components/CommunityChat/ChatContainer.js
import React, { useState } from 'react';
import ChatButton from './ChatButton';
import ChatIframe from './ChatIframe';

const ChatContainer = ({ communityId }) => {
  const [chatVisible, setChatVisible] = useState(false);

  const toggleChat = () => {
    setChatVisible(prev => !prev);
  };

  return (
    <>
      {chatVisible ? (
        // Show the chat iframe overlay.
        <ChatIframe communityId={communityId} onMinimize={toggleChat} />
      ) : (
        // Show the chat button fixed at the bottom right.
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <ChatButton onClick={toggleChat} />
        </div>
      )}
    </>
  );
};

export default ChatContainer;
