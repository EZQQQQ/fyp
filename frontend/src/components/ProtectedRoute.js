// frontend/src/components/ProtectedRoute.js

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser } from "../features/userSlice";

function ProtectedRoute({ children, requiredRoles }) {
  const user = useSelector(selectUser);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
