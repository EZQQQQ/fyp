// frontend/src/components/ProtectedProfileRoute.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectUser } from "../features/userSlice";

export default function ProtectedProfileRoute({ children }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  // 1) Not logged in → /auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2) Profile incomplete and not already creating → /profile-creation
  if (!user.profileComplete && location.pathname !== "/profile-creation") {
    return <Navigate to="/profile-creation" replace />;
  }

  // 3) Profile is already complete, but user is on /profile-creation → redirect home
  if (user.profileComplete && location.pathname === "/profile-creation") {
    return <Navigate to="/" replace />;
  }

  // 4) Otherwise render direct child or nested
  return children ? children : <Outlet />;
}
