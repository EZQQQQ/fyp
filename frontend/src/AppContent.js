// frontend/src/AppContent.js
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Layout & Guards
import DefaultLayout from "./layout/DefaultLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedProfileRoute from "./components/ProtectedProfileRoute";

// Pages
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
import ReportedContentPage from "./components/Report/ReportedContentPage";

// Redux Slice
import { logout, selectUser, fetchUserData } from "./features/userSlice";

// Styles and Notifications
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppContent = ({ socket }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();

  const hideDashboard = location.pathname.startsWith("/chat");

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true";
  });

  const [loadingApp, setLoadingApp] = useState(true);
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Fetch user on mount
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch {
          dispatch(logout());
        }
      }
      setLoadingApp(false);
    })();
  }, [dispatch]);

  if (loadingApp) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingAnimation />
        <p className="text-xl text-gray-700 dark:text-gray-300 mt-4">Loading...</p>
      </div>
    );
  }

  const openCreateCommunityModal = () => setIsCreateCommunityOpen(true);
  const closeCreateCommunityModal = () => setIsCreateCommunityOpen(false);

  return (
    <>
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
      <NotificationsListener socket={socket} />

      <Routes>
        {/** 1) Public **/}
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/** 2) Profile creation (must be authenticated, but profileComplete may be false) **/}
        <Route
          path="/profile-creation"
          element={
            <ProtectedRoute>
              <ProtectedProfileRoute>
                <ProfileCreation />
              </ProtectedProfileRoute>
            </ProtectedRoute>
          }
        />

        {/** 3) Everything else (auth + profileComplete) **/}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedProfileRoute />}>
            {/** Chat route falls outside main layout **/}
            <Route path="/chat/:communityId" element={<CommunityChatPage />} />

            {/** Main application shell **/}
            <Route
              path="/*"
              element={
                <DefaultLayout
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  user={user}
                  openCreateCommunityModal={openCreateCommunityModal}
                  socket={socket}
                />
              }
            >
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route index element={<AllQuestions />} />
              <Route path="question/:questionId" element={<MainQuestion />} />
              <Route path="add-question" element={<AddQuestion />} />
              <Route
                path="explore"
                element={<CommunityList isTileView={true} />}
              />
              <Route path="communities/:id" element={<CommunityPage />} />
              <Route
                path="communities/:communityId/create-quiz"
                element={<CreateQuizPage />}
              />
              <Route
                path="communities/:communityId/create-quiz/ai"
                element={<CreateQuizWithAIPage />}
              />
              <Route
                path="quiz/:quizId/instructions"
                element={<QuizInstructionsPage />}
              />
              <Route
                path="quiz/:quizId/attempt/:attemptId"
                element={<AttemptQuizPage />}
              />
              <Route
                path="quiz/:quizId/attempt/:attemptId/results"
                element={<QuizResultsPage />}
              />
              <Route
                path="quiz/:quizId/edit"
                element={<EditQuizPage />}
              />
              <Route path="search" element={<SearchResults />} />
              <Route
                path="bookmark"
                element={<BookmarkedQuestions />}
              />
              <Route
                path="reports"
                element={<ReportedContentPage />}
              />

              {/** catch‑all inside layout */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Route>
      </Routes>

      {user && !hideDashboard && <Dashboard />}
      {user && <CreateCommunity isOpen={isCreateCommunityOpen} onClose={closeCreateCommunityModal} />}
    </>
  );
}

export default AppContent;