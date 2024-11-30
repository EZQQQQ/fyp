// /frontend/src/features/userSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/userService";
import { toast } from "react-toastify";

// Async thunk for SSO login
export const ssoLoginUser = createAsyncThunk(
  "user/ssoLogin",
  async ({ token, isAdmin }, { rejectWithValue }) => {
    try {
      console.log("ssoLoginUser thunk called with:", { token, isAdmin });
      const data = await userService.ssoLogin({ token, isAdmin });
      console.log("ssoLoginUser response:", data);
      return data;
    } catch (error) {
      console.error("ssoLoginUser error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "SSO Login failed"
      );
    }
  }
);

// Async thunk for admin login via email/password
export const adminLogin = createAsyncThunk(
  "user/adminLogin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await userService.adminLogin({ email, password });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Admin Login failed"
      );
    }
  }
);

// Async thunk for creating user profile after SSO login
export const createUserProfile = createAsyncThunk(
  "user/createProfile",
  async ({ username, profilePicture }, { rejectWithValue }) => {
    try {
      const data = await userService.createProfile({
        username,
        profilePicture,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Profile creation failed"
      );
    }
  }
);

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const data = await userService.fetchUserData();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch user data"
      );
    }
  }
);

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      toast.info("Logged out successfully.");
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle SSO Login
      .addCase(ssoLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ssoLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        localStorage.setItem("token", action.payload.data.token);
        toast.success("SSO Login successful!");
      })
      .addCase(ssoLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Handle Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        localStorage.setItem("token", action.payload.data.token);
        toast.success("Admin login successful!");
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Handle Profile Creation
      .addCase(createUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        localStorage.setItem("token", action.payload.data.token);
        toast.success("Profile created successfully!");
      })
      .addCase(createUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Handle Fetch User Data
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
        // Logout the user if fetching data fails
        state.token = null;
        localStorage.removeItem("token");
      });
  },
});

export const { logout } = userSlice.actions;
export const selectUser = (state) => state.user?.user || null;
export const selectToken = (state) => state.user?.token || null;
export default userSlice.reducer;
