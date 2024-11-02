// frontend/src/components/Dashboard.js

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logout } from "../features/userSlice";
import { Button } from "@mui/material";

function Dashboard() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Welcome, {user.name}!
          </h1>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Display content based on role */}
        {user.role === "admin" || user.role === "professor" ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Admin/Professor Features
            </h2>
            {/* Add admin/professor specific content here */}
            <p className="text-gray-700 dark:text-gray-300">
              Here you can manage communities, questions, and more.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Student Features
            </h2>
            {/* Add student specific content here */}
            <p className="text-gray-700 dark:text-gray-300">
              Here you can ask questions, participate in communities, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
