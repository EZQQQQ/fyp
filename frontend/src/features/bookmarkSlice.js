// frontend/src/features/bookmarkSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bookmarkService from "../services/bookmarkService";
import { toast } from "react-toastify";

/**
 * toggleBookmark - Thunk to toggle a question's bookmark status for the current user.
 * @param {string} questionId - The ID of the question to bookmark/unbookmark
 * @returns {object} - The updated user object from the server
 */
export const toggleBookmark = createAsyncThunk(
  "bookmark/toggleBookmark",
  async (questionId, { rejectWithValue }) => {
    try {
      // Make a PUT request (using bookmarkService) to toggle the bookmark
      const updatedUser = await bookmarkService.toggleBookmarkQuestion(questionId);
      return updatedUser; // Contains updated bookmarkedQuestions in the user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle bookmark"
      );
    }
  }
);

/**
 * bookmarkSlice - Stores the list of bookmarked question IDs + any loading/error states
 */
const bookmarkSlice = createSlice({
  name: "bookmark",
  initialState: {
    bookmarkedQuestions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(toggleBookmark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fulfilled: the server returned the updated user object
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload;
        // We'll store the `bookmarkedQuestions` array from the updated user
        state.bookmarkedQuestions = updatedUser.bookmarkedQuestions || [];
        toast.success("Bookmark toggled successfully!");
      })
      // Rejected
      .addCase(toggleBookmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Bookmark toggle failed!");
      });
  },
});

export default bookmarkSlice.reducer;
