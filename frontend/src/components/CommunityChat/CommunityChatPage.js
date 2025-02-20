// frontend/src/components/CommunityChat/CommunityChatPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatSessionProvider } from '../CommunityChat/ChatSessionProvider';
import ChatBox from '../CommunityChat/ChatBox';

const CommunityChatPage = () => {
  // URL to contain a :communityId parameter.
  const { communityId } = useParams();

  return (
    <ChatSessionProvider communityId={communityId}>
      {/* This container fills the viewport */}
      <div style={{ width: '100vw', height: '100vh', background: '#f9f9f9' }}>
        <ChatBox communityId={communityId} onMinimize={() => { }} />
      </div>
    </ChatSessionProvider>
  );
};

export default CommunityChatPage;
