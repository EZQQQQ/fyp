// /frontend/src/features/voteSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Structure: { [targetId]: { voteCount, userHasUpvoted, userHasDownvoted } }
  voteData: {},
};

const voteSlice = createSlice({
  name: "vote",
  initialState,
  reducers: {
    setVoteData: (state, action) => {
      const { targetId, voteInfo } = action.payload;
      state.voteData[targetId] = voteInfo;
    },
    clearVoteData: (state) => {
      state.voteData = {};
    },
  },
});

export const { setVoteData, clearVoteData } = voteSlice.actions;

export const selectVoteData = (state) => state.vote.voteData;

export default voteSlice.reducer;
