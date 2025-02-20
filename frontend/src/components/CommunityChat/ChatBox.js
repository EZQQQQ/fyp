import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChatMessage from './ChatMessage';
import { useChatSession } from './ChatSessionProvider';
import config from '../../config';
import io from 'socket.io-client';
import axios from '../../utils/axiosConfig';
import { addMessage, setMessages } from '../../features/communityChatSlice';
import { toast } from 'react-toastify';
import './ChatBox.css';

const socket = io(config.BACKEND_URL);

const ChatBox = ({ communityId, onMinimize, hideMinimize = false }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const messages = useSelector((state) => state.communityChat.messages);
  const { anonymousName } = useChatSession();

  // Create a ref for the chat window
  const chatWindowRef = useRef(null);

  // Fetch historical messages on mount
  useEffect(() => {
    if (communityId) {
      axios.get(`/chat/${communityId}/messages`)
        .then(response => {
          if (response.data && response.data.messages) {
            dispatch(setMessages(response.data.messages));
          }
        })
        .catch(error => {
          console.error("Error fetching historical messages:", error);
          toast.error("Error loading chat history");
        });
    }
  }, [communityId, dispatch]);

  // Socket listeners
  useEffect(() => {
    if (anonymousName && communityId) {
      socket.emit('joinRoom', { communityId, anonymousName });
    }

    socket.on('chatMessage', (message) => {
      dispatch(addMessage(message));
    });

    socket.on('chatError', (errorData) => {
      toast.error(errorData.message || "Message not sent due to profanity.");
    });

    return () => {
      if (anonymousName && communityId) {
        socket.emit('leaveRoom', { communityId, anonymousName });
      }
      socket.off('chatMessage');
      socket.off('chatError');
    };
  }, [communityId, anonymousName, dispatch]);

  // Auto-scroll the chat window to the bottom when messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const messageData = {
        content: input,
        sender: anonymousName,
        communityId,
        createdAt: new Date().toISOString(),
      };
      socket.emit('chatMessage', messageData);
      setInput('');
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-window" ref={chatWindowRef}>
        <ul className="message-list">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
        </ul>
      </div>
      <div className="chat-input">
        <div className="messageBox">
          <input
            required
            placeholder="Message..."
            type="text"
            className="message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button className="send-button" onClick={handleSend}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
              <path
                fill="none"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
              ></path>
              <path
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="33.67"
                stroke="#6c6c6c"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
