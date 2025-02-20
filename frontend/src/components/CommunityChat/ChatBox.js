// frontend/src/components/CommunityChat/ChatBox.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChatMessage from './ChatMessage';
import { useChatSession } from './ChatSessionProvider';
import config from '../../config';
import io from 'socket.io-client';
import axios from '../../utils/axiosConfig';
import { addMessage, setMessages } from '../../features/communityChatSlice';
import './ChatBox.css';

// Create a singleton socket connection using your backend URL.
const socket = io(config.BACKEND_URL);

const ChatBox = ({ communityId, onMinimize }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  // Get messages from Redux
  const messages = useSelector((state) => state.communityChat.messages);
  const { anonymousName } = useChatSession();

  // Fetch historical messages on mount
  useEffect(() => {
    if (communityId) {
      axios.get(`/chat/${communityId}/messages`)
        .then(response => {
          if (response.data && response.data.messages) {
            // Set the historical messages into Redux
            dispatch(setMessages(response.data.messages));
          }
        })
        .catch(error => {
          console.error("Error fetching historical messages:", error);
        });
    }
  }, [communityId, dispatch]);

  useEffect(() => {
    // Only join the room if both communityId and anonymousName are available.
    if (anonymousName && communityId) {
      socket.emit('joinRoom', { communityId, anonymousName });
    }

    // Listen for new chat messages via socket.io
    socket.on('chatMessage', (message) => {
      dispatch(addMessage(message));
    });

    // Cleanup on component unmount
    return () => {
      if (anonymousName && communityId) {
        socket.emit('leaveRoom', { communityId, anonymousName });
      }
      socket.off('chatMessage');
    };
  }, [communityId, anonymousName, dispatch]);

  const handleSend = () => {
    if (input.trim()) {
      const messageData = {
        content: input,
        sender: anonymousName,
        communityId,
        createdAt: new Date().toISOString(),
      };
      // Emit the message to the server so that all clients in the room receive it
      socket.emit('chatMessage', messageData);
      setInput('');
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>Chat</span>
        <button className="minimize-button items-center justify-center" onClick={onMinimize}>–</button>
      </div>
      <div className="chat-window">
        <ul className="message-list">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
        </ul>
      </div>
      <div className="chat-input">
        <input
          type="text"
          className="message-input"
          placeholder="Type your message here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
