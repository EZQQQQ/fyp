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
import CommunityPage from "./components/Community/CommunityPage";
import SearchResults from "./components/Search/SearchResults";

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true" || false;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // State for CreateCommunity Modal
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);

  // Handle dark mode toggle
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

  // Handlers to open and close the CreateCommunity modal
  const openCreateCommunityModal = () => {
    setIsCreateCommunityOpen(true);
  };

  const closeCreateCommunityModal = () => {
    setIsCreateCommunityOpen(false);
  };

  // Render the app
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
      <Router>
        {/* Header */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Single ToastContainer */}
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

        <div className="flex flex-1 pt-16">
          {/* Sidebar */}
          {user && (
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              openCreateCommunityModal={openCreateCommunityModal} // Pass the handler
            />
          )}

          {/* Overlay for Mobile Sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
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
                    <CommunityList isTileView={true} />
                  </ProtectedRoute>
                }
              />
              {/* View Community Page */}
              <Route
                path="/communities/:id"
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                }
              />
              {/* Search Results */}
              <Route path="/search" element={<SearchResults />} />
              {/* Catch-All Route */}
              <Route
                path="*"
                element={<Navigate to={user ? "/" : "/auth"} replace />}
              />
            </Routes>
          </div>
        </div>

        {/* CreateCommunity Modal */}
        {user && (
          <CreateCommunity
            isOpen={isCreateCommunityOpen}
            onClose={closeCreateCommunityModal}
          />
        )}
      </Router>
    </div>
  );
}

export default App;