// /frontend/src/App.js

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import BookmarkedQuestions from "./components/Bookmark/BookmarkedQuestions";
import CreateQuizPage from "./components/Quiz/CreateQuizPage";
import CreateQuizWithAIPage from "./components/Quiz/CreateQuizWithAIPage";
import AttemptQuizPage from "./components/Quiz/AttemptQuizPage";
import EditQuizPage from "./components/Quiz/EditQuizPage";
import QuizInstructionsPage from "./components/Quiz/QuizInstructionsPage";
import QuizResultsPage from "./components/Quiz/QuizResultsPage";
import NotificationsListener from "./components/Notification/NotificationsListener";
import LoadingAnimation from "./components/LoadingAnimation/LoadingAnimation";
import CommunityChatPage from "./components/CommunityChat/CommunityChatPage";
import ReportedContentPage from './components/Report/ReportedContentPage';

// Redux Slice
import { logout, selectUser, fetchUserData } from "./features/userSlice";

// Styles and Notifications
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// A wrapper component that provides access to the location
// and conditionally renders the Dashboard component
const AppContent = ({ socket }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const location = useLocation();

  // Determine if the Dashboard should be hidden (e.g., for Community Chat in an iframe)
  const hideDashboard = location.pathname.startsWith("/chat");

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true" || false;
  });

  // App Loading State
  const [appLoading, setAppLoading] = useState(true);

  // CreateCommunity Modal State
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);

  // Toggle Dark Mode Effect
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

  // Display a loading screen until the app has initialized
  if (appLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 relative">
        <LoadingAnimation />
        <p className="text-xl text-gray-700 dark:text-gray-300 mt-4">Loading...</p>
      </div>
    );
  }

  // Handlers for CreateCommunity modal
  const openCreateCommunityModal = () => setIsCreateCommunityOpen(true);
  const closeCreateCommunityModal = () => setIsCreateCommunityOpen(false);

  return (
    <>
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

      {/* Notifications Listener */}
      <NotificationsListener socket={socket} />

      <Routes>
        {/* ===== Standalone Routes (No Layout) ===== */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Community Chat Page */}
        <Route
          path="/chat/:communityId"
          element={
            <ProtectedRoute>
              <CommunityChatPage />
            </ProtectedRoute>
          }
        />

        {/* ===== Routes with DefaultLayout ===== */}
        <Route
          path="/*"
          element={
            <DefaultLayout
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              user={user}
              openCreateCommunityModal={openCreateCommunityModal}
            />
          }
        >
          <Route
            path="create-profile"
            element={
              <ProtectedRoute>
                <ProfileCreation />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="questions"
            element={
              <ProtectedRoute>
                <AllQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="question/:questionId"
            element={
              <ProtectedRoute>
                <MainQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="add-question"
            element={
              <ProtectedRoute>
                <AddQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="explore"
            element={
              <ProtectedRoute>
                <CommunityList isTileView={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="communities/:id"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="quiz/:quizId/instructions"
            element={
              <ProtectedRoute>
                <QuizInstructionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="communities/:communityId/create-quiz"
            element={
              <ProtectedRoute>
                <CreateQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="communities/:communityId/create-quiz/ai"
            element={
              <ProtectedRoute>
                <CreateQuizWithAIPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="quiz/:quizId/attempt/:attemptId"
            element={
              <ProtectedRoute>
                <AttemptQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="quiz/:quizId/attempt/:attemptId/results"
            element={
              <ProtectedRoute>
                <QuizResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="quiz/:quizId/edit"
            element={
              <ProtectedRoute>
                <EditQuizPage />
              </ProtectedRoute>
            }
          />
          <Route path="search" element={<SearchResults />} />
          <Route
            path="bookmark"
            element={
              <ProtectedRoute>
                <BookmarkedQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute>
                <ReportedContentPage />
              </ProtectedRoute>
            }
          />
          <Route
            index
            element={
              <ProtectedRoute requiredRoles={["student", "professor", "admin"]}>
                <AllQuestions />
              </ProtectedRoute>
            }
          />
          {/* Redirect all unmatched paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* Conditionally render the Dashboard only if the user exists and the route is not for Community Chat */}
      {user && !hideDashboard && <Dashboard />}

      {/* CreateCommunity Modal */}
      {user && (
        <CreateCommunity
          isOpen={isCreateCommunityOpen}
          onClose={closeCreateCommunityModal}
        />
      )}
    </>
  );
};

function App(props) {
  return (
    <Router>
      <AppContent {...props} />
    </Router>
  );
}

export default App;
