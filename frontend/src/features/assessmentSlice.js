// /frontend/src/features/assessmentSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import assessmentService from "../services/assessmentService";

// Thunk to fetch assessment tasks
export const fetchAssessmentTasks = createAsyncThunk(
  "assessment/fetchAssessmentTasks",
  async (communityId, { rejectWithValue }) => {
    try {
      const data = await assessmentService.getAssessmentTasks(communityId);
      return data.tasks; // Assuming data contains { tasks: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk to fetch user participation
export const fetchUserParticipation = createAsyncThunk(
  "assessment/fetchUserParticipation",
  async (communityId, { rejectWithValue }) => {
    try {
      const data = await assessmentService.getUserParticipation(communityId);
      return data.participation; // Assuming data contains { participation: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk to fetch participation for all community members
export const fetchAllParticipation = createAsyncThunk(
  "assessment/fetchAllParticipation",
  async (communityId, { rejectWithValue }) => {
    try {
      const data = await assessmentService.getAllParticipation(communityId);
      return data.participation; // Assuming data contains { participation: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk to create an assessment task
export const createAssessmentTask = createAsyncThunk(
  "assessment/createAssessmentTask",
  async ({ communityId, taskData }, { rejectWithValue }) => {
    try {
      const data = await assessmentService.createAssessmentTask(
        communityId,
        taskData
      );
      return data; // Returns the created task
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk to update an assessment task
export const updateAssessmentTask = createAsyncThunk(
  "assessment/updateAssessmentTask",
  async ({ communityId, taskId, taskData }, { rejectWithValue }) => {
    try {
      const data = await assessmentService.updateAssessmentTask(
        communityId,
        taskId,
        taskData
      );
      return data; // Returns the updated task
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk to delete an assessment task
export const deleteAssessmentTask = createAsyncThunk(
  "assessment/deleteAssessmentTask",
  async ({ communityId, taskId }, { rejectWithValue }) => {
    try {
      await assessmentService.deleteAssessmentTask(communityId, taskId);
      return taskId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const assessmentSlice = createSlice({
  name: "assessment",
  initialState: {
    tasks: [],
    participation: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Assessment Tasks
    builder
      .addCase(fetchAssessmentTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload || []; // Assign the tasks array
      })
      .addCase(fetchAssessmentTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch User Participation
    builder
      .addCase(fetchUserParticipation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserParticipation.fulfilled, (state, action) => {
        state.loading = false;
        state.participation = action.payload || [];
      })
      .addCase(fetchUserParticipation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch All Participation
    builder
      .addCase(fetchAllParticipation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllParticipation.fulfilled, (state, action) => {
        state.loading = false;
        state.allParticipation = action.payload || [];
      })
      .addCase(fetchAllParticipation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Assessment Task
    builder
      .addCase(createAssessmentTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssessmentTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createAssessmentTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Assessment Task
    builder
      .addCase(updateAssessmentTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssessmentTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateAssessmentTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Assessment Task
    builder
      .addCase(deleteAssessmentTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssessmentTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      })
      .addCase(deleteAssessmentTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assessmentSlice.reducer;
