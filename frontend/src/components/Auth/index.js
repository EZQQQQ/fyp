// /frontend/src/components/Auth/index.js

import React, { useState } from "react";
import { Button } from "@mui/material";
import "./index.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import { useDispatch } from "react-redux";
import { login } from "../../features/userSlice";

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
        const response = await axiosInstance.post("/user/register", {
          name,
          email,
          password,
        });
        const { user, token } = response.data.data;
        // Save token to localStorage
        localStorage.setItem("token", token);
        // Update Redux store
        dispatch(login(user));
        navigate("/");
        setLoading(false);
      } catch (error) {
        console.error("Registration Error:", error.response?.data);
        setError(error.response?.data?.message || "Registration failed");
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
        const response = await axiosInstance.post("/user/login", {
          email,
          password,
        });
        const { user, token } = response.data.data;
        // Save token to localStorage
        localStorage.setItem("token", token);
        // Update Redux store
        dispatch(login(user));
        navigate("/");
        setLoading(false);
      } catch (error) {
        console.error("Login Error:", error.response?.data);
        setError(error.response?.data?.message || "Login failed");
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth">
      <div className="auth-container">
        <div className="auth-login">
          <div className="auth-login-container">
            {error && <p className="error-message">{error}</p>}
            {registerMode ? (
              <>
                {/* Registration Form */}
                <div className="input-field">
                  <p>Name</p>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <p>Email</p>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <p>Password</p>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </>
            ) : (
              <>
                {/* Login Form */}
                <div className="input-field">
                  <p>Email</p>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <p>Password</p>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Logging In..." : "Login"}
                </Button>
              </>
            )}
            {/* Toggle Link */}
            <p
              onClick={() => setRegisterMode(!registerMode)}
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
                marginTop: "10px",
              }}
            >
              {registerMode
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
