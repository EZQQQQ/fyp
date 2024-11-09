// /frontend/src/app/store.js

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import communityReducer from "../features/communitySlice";
import voteReducer from "../features/voteSlice";
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

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "token"],
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);
const persistedCommunityReducer = persistReducer(
  { ...persistConfig, key: "communities" },
  communityReducer
);
const persistedVoteReducer = persistReducer(
  { ...persistConfig, key: "votes" },
  voteReducer
);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    communities: persistedCommunityReducer,
    vote: persistedVoteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
