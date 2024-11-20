// /frontend/src/app/store.js

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import communityReducer from "../features/communitySlice";
import voteReducer from "../features/voteSlice";
import assessmentReducer from "../features/assessmentSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

// Combine all reducers into a root reducer
const rootReducer = combineReducers({
  user: userReducer,
  communities: communityReducer,
  vote: voteReducer,
  assessment: assessmentReducer,
});

// Single persist configuration for the entire store
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "communities", "vote", "assessment"], // Persist these slices
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create a persistor
export const persistor = persistStore(store);
