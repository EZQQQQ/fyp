// frontend/src/features/communitySlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import communityService from "../services/communityService";
import { toast } from "react-toastify";

// Thunk to fetch all communities
export const fetchCommunities = createAsyncThunk(
  "communities/fetchCommunities",
  async (_, thunkAPI) => {
    try {
      const response = await communityService.fetchCommunities();
      if (response.status) {
        return response.data; // return the communities array
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
      if (response.status) {
        return response.communities; // return the communities array
      } else {
        return thunkAPI.rejectWithValue("Failed to fetch user communities.");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch user communities."
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
        return response.data.data; // Return the newly created community
      } else {
        return thunkAPI.rejectWithValue(
          response.message || "Failed to create community."
        );
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
        return response.data; // Assuming response.data is the updated community
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

// Thunk to check if a community name exists
export const checkCommunityName = createAsyncThunk(
  "communities/checkCommunityName",
  async (name, { rejectWithValue }) => {
    try {
      const response = await communityService.checkCommunityName(name);
      // Assuming API returns { exists: true/false }
      return { exists: response.exists };
    } catch (error) {
      return rejectWithValue(error.message || "Error checking community name");
    }
  }
);

const communitySlice = createSlice({
  name: "communities",
  initialState: {
    communities: [],
    userCommunities: [],
    loading: false,
    error: null,
    // New state properties for name checking
    nameCheck: {
      checking: false,
      exists: false,
      error: null,
    },
  },
  reducers: {
    resetNameCheck: (state) => {
      state.nameCheck = {
        checking: false,
        exists: false,
        error: null,
      };
    },
    // ... other reducers ...
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
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.userCommunities = action.payload;
      })
      .addCase(fetchUserCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload); // Only for fetching user communities
      })

      // Handle createCommunity
      .addCase(createCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.communities.push(action.payload); // Add to all communities
        state.userCommunities.push(action.payload); // Add to user's communities
        toast.success("Community created successfully!");
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to create community.");
      })

      // Handle joinCommunity
      .addCase(joinCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
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
          toast.success(`Joined community: ${updatedCommunity.name}`);
        }
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to join community.");
      })

      // Handle checkCommunityName
      .addCase(checkCommunityName.pending, (state) => {
        state.nameCheck = {
          checking: true,
          exists: false,
          error: null,
        };
      })
      .addCase(checkCommunityName.fulfilled, (state, action) => {
        state.nameCheck = {
          checking: false,
          exists: action.payload.exists,
          error: null,
        };
      })
      .addCase(checkCommunityName.rejected, (state, action) => {
        state.nameCheck = {
          checking: false,
          exists: false,
          error: action.payload || "Error checking community name",
        };
      });
  },
});

// Selectors
export const selectCommunities = (state) => state.communities.communities;
export const selectUserCommunities = (state) =>
  state.communities.userCommunities;
export const selectNameCheck = (state) => state.communities.nameCheck;

export const { resetNameCheck } = communitySlice.actions;
export default communitySlice.reducer;
