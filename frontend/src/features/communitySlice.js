// /frontend/src/features/communitySlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import communityService from "../services/communityService";
import { toast } from "react-toastify";

// Thunk to fetch communities
export const fetchCommunities = createAsyncThunk(
  "communities/fetchCommunities",
  async (_, thunkAPI) => {
    try {
      const response = await communityService.fetchCommunities();
      if (response.status) {
        return response.data; // Return the array of communities
      } else {
        return thunkAPI.rejectWithValue("Failed to fetch communities.");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch communities."
      );
    }
  }
);

// Thunk to fetch user's communities
export const fetchUserCommunities = createAsyncThunk(
  "communities/fetchUserCommunities",
  async (_, thunkAPI) => {
    try {
      const response = await communityService.getUserCommunities();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Thunk to create a community
export const createCommunity = createAsyncThunk(
  "communities/createCommunity",
  async (communityData, thunkAPI) => {
    try {
      const response = await communityService.createCommunity(communityData);
      if (response.status) {
        return response.data.data; // Return the newly created community
      } else {
        return thunkAPI.rejectWithValue("Failed to create community.");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create community."
      );
    }
  }
);

// Thunk to join a community
export const joinCommunity = createAsyncThunk(
  "communities/joinCommunity",
  async (communityId, thunkAPI) => {
    try {
      const response = await communityService.joinCommunity(communityId);
      if (response.status) {
        return response.data; // Return updated community data if needed
      } else {
        return thunkAPI.rejectWithValue("Failed to join community.");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to join community."
      );
    }
  }
);

const communitySlice = createSlice({
  name: "communities",
  initialState: {
    communities: [],
    userCommunities: [],
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    // Add synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCommunities
      .addCase(fetchCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload; // Set fetched communities
      })
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload); // Only for fetching communities
      })

      // Handle fetchUserCommunities
      .addCase(fetchUserCommunities.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserCommunities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userCommunities = action.payload.communities;
      })
      .addCase(fetchUserCommunities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      })

      // Handle createCommunity
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.communities.push(action.payload); // Add to all communities
        state.userCommunities.push(action.payload); // Add to user's communities
      })

      // Handle joinCommunity
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming the backend returns the updated community
        const updatedCommunity = action.payload;
        const index = state.communities.findIndex(
          (community) => community._id === updatedCommunity._id
        );
        if (index !== -1) {
          state.communities[index] = updatedCommunity;
        }
        // Add to user's communities if not already present
        const userCommunityExists = state.userCommunities.some(
          (community) => community._id === updatedCommunity._id
        );
        if (!userCommunityExists) {
          state.userCommunities.push(updatedCommunity);
        }
      });
  },
});

// Selector to access communities from the state
export const selectCommunities = (state) => state.communities.communities;
export const selectUserCommunities = (state) =>
  state.communities.userCommunities;

export default communitySlice.reducer;
