// frontend/src/components/ProtectedProfileRoute.js
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';

const ProtectedProfileRoute = ({ children }) => {
  const user = useSelector(selectUser);
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    console.log("ProtectedProfileRoute check:", {
      hasUser: !!user,
      username: user?.username,
      path: location.pathname,
      redirectNeeded: user && !user.username && !isExemptPath(location.pathname)
    });
  }, [user, location]);

  // Helper function to check exempt paths
  const isExemptPath = (path) => {
    const allowedPaths = ['/profile-creation', '/unauthorized', '/auth', '/admin/login'];
    return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
  };

  // If no user yet, show loading or wait
  if (!user) {
    return null; // Or a loading spinner
  }

  // Check if user exists but hasn't completed profile - AND we're not already on an exempt path
  const needsProfileCreation = user && !user.username && !isExemptPath(location.pathname);

  // Redirect to profile creation if needed
  if (needsProfileCreation) {
    console.log("🚨 Redirecting to profile creation from:", location.pathname);
    return <Navigate to="/profile-creation" replace />;
  }

  // If we're on an exempt path or the user has a profile, allow access
  return children || <Outlet />;
};

export default ProtectedProfileRoute;