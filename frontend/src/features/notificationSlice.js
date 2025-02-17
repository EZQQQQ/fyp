// frontend/src/features/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchNotificationsAPI } from "../services/notificationService";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (userId) => {
    const data = await fetchNotificationsAPI(userId);
    // console.log("Notifications thunk received:", data);
    return data;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    status: "idle",
    error: null,
  },
  reducers: {
    notificationAdded(state, action) {
      state.notifications.unshift(action.payload);
    },
    markNotificationRead(state, action) {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { notificationAdded, markNotificationRead, markAllNotificationsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
