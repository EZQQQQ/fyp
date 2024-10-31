// /frontend/src/app/store.js

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import communityReducer from "../features/communitySlice";
import voteReducer from "../features/voteSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    communities: communityReducer,
    vote: voteReducer,
  },
});
