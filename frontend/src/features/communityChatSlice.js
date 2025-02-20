// frontend/src/features/communityChatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import communityChatService from '../services/communityChatService';

const initialState = {
  anonymousName: null,
  messages: [],
  status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const joinChat = createAsyncThunk(
  'communityChat/joinChat',
  async (communityId, thunkAPI) => {
    try {
      return await communityChatService.joinChat(communityId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const leaveChat = createAsyncThunk(
  'communityChat/leaveChat',
  async ({ communityId, name }, thunkAPI) => {
    try {
      return await communityChatService.leaveChat(communityId, name);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'communityChat/sendMessage',
  async (messageData, thunkAPI) => {
    try {
      return await communityChatService.sendMessage(messageData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const communityChatSlice = createSlice({
  name: 'communityChat',
  initialState,
  reducers: {
    // For initializing chat history
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    // For real-time additions
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.anonymousName = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinChat.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(joinChat.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.anonymousName = action.payload.name;
      })
      .addCase(joinChat.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Assuming the API returns { data: newMessage }
        state.messages.push(action.payload.data);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(leaveChat.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(leaveChat.fulfilled, (state) => {
        state.status = 'succeeded';
        state.anonymousName = null;
      })
      .addCase(leaveChat.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setMessages, addMessage, clearChat } = communityChatSlice.actions;
export default communityChatSlice.reducer;
