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

// Thunk to create a community
export const createCommunity = createAsyncThunk(
  "communities/createCommunity",
  async (communityData, thunkAPI) => {
    try {
      const response = await communityService.createCommunity(communityData);
      if (response.status) {
        return response.data; // Return the newly created community
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
        toast.error(action.payload);
      })

      // Handle createCommunity
      .addCase(createCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.communities.push(action.payload); // Add new community to the list
        toast.success("Community created successfully!");
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Handle joinCommunity
      .addCase(joinCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally, update specific community data here
        // For example, updating the members array
        // This depends on your backend's response structure
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

// Selector to access communities from the state
export const selectCommunities = (state) => state.communities.communities;

export default communitySlice.reducer;
