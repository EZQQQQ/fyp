// frontend/src/App.js

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Layout
import DefaultLayout from "./layout/DefaultLayout";

// Components & Pages
import Auth from "./components/Auth";
import AdminAuth from "./components/Auth/AdminAuth";
import Unauthorized from "./components/Auth/Unauthorized";
import ProfileCreation from "./components/Profile/ProfileCreation";
import AllQuestions from "./components/KnowledgeNode/AllQuestions";
import MainQuestion from "./components/ViewQuestion/MainQuestion";
import AddQuestion from "./components/AddQuestion/Question";
import CommunityList from "./components/Community/CommunityList";
import CommunityPage from "./components/Community/CommunityPage";
import CreateCommunity from "./components/Community/CreateCommunity";
import SearchResults from "./components/Search/SearchResults";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import ProfilePage from "./components/Profile/ProfilePage";
import ProfileSettings from "./components/Profile/ProfileSettings";

// Redux Slice
import { logout, selectUser, fetchUserData } from "./features/userSlice";

// Styles and Notifications
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true" || false;
  });

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // CreateCommunity Modal State
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Initialize user on app load
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          dispatch(logout());
        }
      }
      setAppLoading(false);
    };
    initializeUser();
  }, [dispatch]);

  // Show loading screen while initializing
  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  // Handlers to open/close CreateCommunity modal
  const openCreateCommunityModal = () => setIsCreateCommunityOpen(true);
  const closeCreateCommunityModal = () => setIsCreateCommunityOpen(false);

  return (
    <Router>
      <DefaultLayout
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        openCreateCommunityModal={openCreateCommunityModal}
      >
        {/* Toast Notifications */}
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

        <Routes>
          {/* Authentication Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Profile Creation - only used once for new users */}
          <Route
            path="/create-profile"
            element={
              <ProtectedRoute>
                <ProfileCreation />
              </ProtectedRoute>
            }
          />

          {/* Profile Page (subsequent visits) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Profile Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <AllQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/question/:questionId"
            element={
              <ProtectedRoute>
                <MainQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-question"
            element={
              <ProtectedRoute>
                <AddQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <CommunityList isTileView={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communities/:id"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchResults />} />

          {/* Root (Home) */}
          <Route
            path="/"
            element={
              <ProtectedRoute requiredRoles={["student", "professor", "admin"]}>
                <AllQuestions />
              </ProtectedRoute>
            }
          />

          {/* Catch-All */}
          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/auth"} replace />}
          />
        </Routes>

        {/* Dashboard */}
        {user && <Dashboard />}

        {/* CreateCommunity Modal */}
        {user && (
          <CreateCommunity
            isOpen={isCreateCommunityOpen}
            onClose={closeCreateCommunityModal}
          />
        )}
      </DefaultLayout>
    </Router>
  );
}

export default App;
