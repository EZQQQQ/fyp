// frontend/src/components/ProtectedRoute.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectUser } from "../features/userSlice";

export default function ProtectedRoute({ children, requiredRoles }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  // 1) Not authenticated → /auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  // 2) Lacks required role → /unauthorized
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  // 3) Authenticated (and role ok) → either render direct child or nested
  return children ? children : <Outlet />;
}
