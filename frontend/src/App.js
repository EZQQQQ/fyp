// frontend/src/App.js

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Sidebar from "./components/KnowledgeNode/Sidebar";
import CreateCommunity from "./components/Community/CreateCommunity";
import CommunityList from "./components/Community/CommunityList";
import CommunityDetail from "./components/Community/CommunityDetail";
import AllQuestions from "./components/KnowledgeNode/AllQuestions";
import MainQuestion from "./components/ViewQuestion/MainQuestion";
import AddQuestion from "./components/AddQuestion/Question";
import Auth from "./components/Auth";
import "./index.css";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser, fetchUserData } from "./features/userSlice"; // Import fetchUserData
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import ProtectedRoute from "./components/ProtectedRoute"; // Import the separate ProtectedRoute

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true" || false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Check if user is already logged in (e.g., token in localStorage)
    const token = localStorage.getItem("token");
    if (token) {
      // Dispatch the fetchUserData thunk without parameters
      dispatch(fetchUserData());
    } else {
      dispatch(logout());
    }
  }, [dispatch]);

  return (
    <div className="app">
      <Router>
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <Routes>
              {/* Home Route - All Questions */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AllQuestions />
                  </ProtectedRoute>
                }
              />

              {/* View Specific Question */}
              <Route
                path="/question/:questionId"
                element={
                  <ProtectedRoute>
                    <MainQuestion />
                  </ProtectedRoute>
                }
              />

              {/* Add New Question */}
              <Route
                path="/add-question"
                element={
                  <ProtectedRoute>
                    <AddQuestion />
                  </ProtectedRoute>
                }
              />

              {/* List All Communities */}
              <Route
                path="/communities"
                element={
                  <ProtectedRoute>
                    <CommunityList />
                  </ProtectedRoute>
                }
              />

              {/* Create New Community - Professors Only */}
              <Route
                path="/communities/create"
                element={
                  <ProtectedRoute requiredRole={["professor", "admin"]}>
                    <CreateCommunity />
                  </ProtectedRoute>
                }
              />

              {/* View Community Details */}
              <Route
                path="/communities/:id"
                element={
                  <ProtectedRoute>
                    <CommunityDetail />
                  </ProtectedRoute>
                }
              />

              {/* Authentication Routes */}
              <Route path="/auth" element={<Auth />} />

              {/* Catch-All Route */}
              <Route
                path="*"
                element={<Navigate to={user ? "/" : "/auth"} replace />}
              />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
