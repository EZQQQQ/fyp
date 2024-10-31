// frontend/src/components/ProtectedRoute.js

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser } from "../features/userSlice";

function ProtectedRoute({ children, requiredRole }) {
  const user = useSelector(selectUser);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
