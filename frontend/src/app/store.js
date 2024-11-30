// /frontend/src/app/store.js

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import communityReducer from "../features/communitySlice";
import voteReducer from "../features/voteSlice";
import assessmentReducer from "../features/assessmentSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Combine all reducers into an app reducer
const appReducer = combineReducers({
  user: userReducer,
  communities: communityReducer,
  vote: voteReducer,
  assessment: assessmentReducer,
});

// Root reducer that resets state on 'user/logout' action
const rootReducer = (state, action) => {
  if (action.type === "user/logout") {
    // Clear the persisted state
    storage.removeItem("persist:root");

    // Reset only the user state
    return appReducer({ ...state, user: undefined }, action);
  }
  return appReducer(state, action);
};

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "communities", "vote", "assessment"],
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
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

// Create a persistor
export const persistor = persistStore(store);
