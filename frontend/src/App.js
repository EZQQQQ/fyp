// /frontend/src/App.js

import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Sidebar from "./components/KnowledgeNode/Sidebar";
import AllQuestions from "./components/KnowledgeNode/AllQuestions";
import MainQuestion from "./components/ViewQuestion/MainQuestion";
import AddQuestion from "./components/AddQuestion/Question";
import Auth from "./components/Auth";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, selectUser } from "./features/userSlice";

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is already logged in (e.g., token in localStorage)
    const token = localStorage.getItem("token");
    if (token) {
      // You might want to fetch user info from backend using the token
      // For now, we'll assume user is logged in
      // You can implement a function to fetch user data
    } else {
      dispatch(logout());
    }
  }, [dispatch]);

  const PrivateRoute = ({ element: Component, ...rest }) => {
    return user ? Component : <Navigate to="/auth" />;
  };

  return (
    <div className="app">
      <Router>
        <Header />
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route
                path="/"
                element={<PrivateRoute element={<AllQuestions />} />}
              />
              <Route
                path="/question/:questionId"
                element={<PrivateRoute element={<MainQuestion />} />}
              />
              <Route
                path="/add-question"
                element={<PrivateRoute element={<AddQuestion />} />}
              />
              <Route path="/auth" element={<Auth />} />
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
