// frontend/src/index.js

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store, persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import config from "./config";
import io from "socket.io-client";
import "./index.css";

// Connect to the backend Socket.IO server
const socket = io(config.BACKEND_URL, {
  autoConnect: false,
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App socket={socket} />
    </PersistGate>
  </Provider>
);

reportWebVitals();
