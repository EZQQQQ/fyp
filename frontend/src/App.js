// /frontend/src/App.js

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
import CommunityList from "./components/Community/CommunityList"; // Will be repurposed as Explore
import CommunityDetail from "./components/Community/CommunityDetail";
import AllQuestions from "./components/KnowledgeNode/AllQuestions";
import MainQuestion from "./components/ViewQuestion/MainQuestion";
import AddQuestion from "./components/AddQuestion/Question";
import Auth from "./components/Auth";
import AdminAuth from "./components/Auth/AdminAuth";
import ProfileCreation from "./components/ProfileCreation";
import Dashboard from "./components/Dashboard";
import Unauthorized from "./components/Auth/Unauthorized";
import "./index.css";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser, fetchUserData } from "./features/userSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";

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
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserData());
    } else {
      dispatch(logout());
    }
  }, [dispatch]);

  return (
    <div className="app">
      <Router>
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
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
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <Routes>
              {/* Authentication Route */}
              <Route path="/auth" element={<Auth />} />

              {/* Admin Authentication Route */}
              <Route path="/admin/login" element={<AdminAuth />} />

              {/* Profile Creation Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileCreation />
                  </ProtectedRoute>
                }
              />

              {/* Unauthorized Access Route */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    requiredRoles={["student", "professor", "admin"]}
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

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

              {/* Explore Communities */}
              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <CommunityList isTileView={true} />{" "}
                  </ProtectedRoute>
                }
              />

              {/* Create New Community - Professors and Admins Only */}
              <Route
                path="/communities/create"
                element={
                  <ProtectedRoute requiredRoles={["professor", "admin"]}>
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

              {/* Catch-All Route */}
              <Route
                path="*"
                element={<Navigate to={user ? "/" : "/auth"} replace />}
              />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
