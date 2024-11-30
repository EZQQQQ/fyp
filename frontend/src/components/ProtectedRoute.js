// /frontend/src/components/ProtectedRoute.js

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser } from "../features/userSlice";

function ProtectedRoute({ children, requiredRoles }) {
  const user = useSelector(selectUser);

  if (!user) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // User does not have the required role, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role (if specified)
  return children;
}

export default ProtectedRoute;
