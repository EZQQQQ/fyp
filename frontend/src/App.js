// frontend/src/App.js
import React from "react";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate } from "react-router-dom";
import AppContent from "./AppContent";

// Define the router using createRoutesFromElements.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppContent />}>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

function App({ socket }) {
  return <RouterProvider router={router} />;
}

export default App;
