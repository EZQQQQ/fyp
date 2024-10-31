// /frontend/src/features/communitySlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import communityService from "../services/communityService";

// Async thunks
export const fetchCommunities = createAsyncThunk(
  "communities/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await communityService.fetchCommunities();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createCommunity = createAsyncThunk(
  "communities/create",
  async (communityData, { rejectWithValue }) => {
    try {
      const response = await communityService.createCommunity(communityData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const joinCommunity = createAsyncThunk(
  "communities/join",
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await communityService.joinCommunity(communityId);
      return { communityId, voteCount: response.data.data.voteCount };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Optional: Leave community
export const leaveCommunity = createAsyncThunk(
  "communities/leave",
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await communityService.leaveCommunity(communityId);
      return { communityId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const communitySlice = createSlice({
  name: "communities",
  initialState: {
    communities: [],
    loading: false,
    error: null,
  },
  reducers: {
    addCommunity: (state, action) => {
      state.communities.push(action.payload);
    },
    // Other synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      // Fetch Communities
      .addCase(fetchCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
      })
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Community
      .addCase(createCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.communities.push(action.payload);
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Join Community
      .addCase(joinCommunity.fulfilled, (state, action) => {
        const { communityId, voteCount } = action.payload;
        const community = state.communities.find(
          (comm) => comm._id === communityId
        );
        if (community) {
          community.members.push(state.user.id);
          community.voteCount = voteCount;
        }
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Optional: Leave Community
      .addCase(leaveCommunity.fulfilled, (state, action) => {
        const { communityId } = action.payload;
        state.communities = state.communities.map((comm) =>
          comm._id === communityId
            ? {
                ...comm,
                members: comm.members.filter(
                  (member) => member !== state.user.id
                ),
              }
            : comm
        );
      })
      .addCase(leaveCommunity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addCommunity } = communitySlice.actions;
export default communitySlice.reducer;
