// frontend/src/components/Auth/AdminAuth.js

import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "../../features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      await dispatch(adminLogin({ email, password })).unwrap();
      navigate("/"); // Redirect to home page after login
    } catch (err) {
      console.error("Admin Login Error:", err);
      // Error handling is already managed in the slice via toast
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        {/* Admin Login Title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Admin Panel Access
          </h2>
        </div>

        {/* Admin Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          {/* Email Field */}
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />

          {/* Password Field */}
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Logging In..." : "Login as Admin"}
          </Button>
        </form>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}

export default AdminAuth;
