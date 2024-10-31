// frontend/src/components/Auth.js

import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser, registerUser } from "../../features/userSlice";

function Auth() {
  const [registerMode, setRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (email === "" || password === "" || name === "") {
      setError("Please fill in all the fields");
      setLoading(false);
    } else {
      try {
        // **Dispatch registerUser instead of signupUser**
        await dispatch(registerUser({ name, email, password })).unwrap();
        navigate("/");
        setLoading(false);
      } catch (error) {
        console.error("Registration Error:", error);
        setError(error || "Registration failed");
        setLoading(false);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (email === "" || password === "") {
      setError("Please fill in all the fields");
      setLoading(false);
    } else {
      try {
        await dispatch(loginUser({ email, password })).unwrap();
        navigate("/");
        setLoading(false);
      } catch (error) {
        console.error("Login Error:", error);
        setError(error || "Login failed");
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
          {registerMode ? "Register" : "Login"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {registerMode ? (
          // Registration Form
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              className="w-full text-white bg-blue-500 hover:bg-blue-600"
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              className="w-full text-white bg-blue-500 hover:bg-blue-600"
            >
              {loading ? "Logging In..." : "Login"}
            </Button>
          </form>
        )}

        {/* Toggle Link */}
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
          {registerMode
            ? "Already have an account? "
            : "Don't have an account? "}
          <span
            onClick={() => setRegisterMode(!registerMode)}
            className="text-blue-500 cursor-pointer hover:text-blue-600"
          >
            {registerMode ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
