// frontend/src/components/CommunityChat/ChatSessionProvider.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../../utils/axiosConfig';

const ChatSessionContext = createContext();

export const ChatSessionProvider = ({ children, communityId }) => {
  const [anonymousName, setAnonymousName] = useState(null);

  useEffect(() => {
    // If no anonymous name is set and we have a communityId,
    // call the backend endpoint to join the chat and assign a unique name.
    if (!anonymousName && communityId) {
      axios
        .post(`/chat/${communityId}/join`)
        .then(response => {
          // backend returns { name: "unique-anonymous-name" }
          setAnonymousName(response.data.name);
        })
        .catch(error => {
          console.error("Error joining chat:", error);
        });
    }
  }, [anonymousName, communityId]);

  return (
    <ChatSessionContext.Provider value={{ anonymousName, setAnonymousName }}>
      {children}
    </ChatSessionContext.Provider>
  );
};

export const useChatSession = () => useContext(ChatSessionContext);
