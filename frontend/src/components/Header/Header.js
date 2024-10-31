// frontend/src/components/Header/Header.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Avatar } from "@mui/material";
import Logo from "../../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "../../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase-config";

function Header({ darkMode, setDarkMode }) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle user sign out
  const handleSignOut = () => {
    if (user) {
      signOut(auth)
        .then(() => {
          dispatch(logout());
          console.log("User signed out");
          navigate("/auth");
        })
        .catch((error) => {
          console.error("Sign-out Error:", error);
        });
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img src={Logo} alt="KnowledgeNode Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Search Bar (Visible on medium and larger screens) */}
          <div className="hidden md:block w-1/2">
            <div className="relative text-gray-600 dark:text-gray-300">
              <input
                type="search"
                name="search"
                placeholder="Search..."
                className="bg-gray-100 dark:bg-gray-700 h-10 px-5 pr-10 rounded-full text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-600 w-full"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 mt-3 mr-4"
                aria-label="Search"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 56.966 56.966"
                >
                  <path
                    d="M55.146,51.887L41.588,38.329c3.486-4.074,5.597-9.297,5.597-14.829
                    c0-12.682-10.318-23-23-23s-23,10.318-23,23s10.318,23,23,23
                    c5.532,0,10.754-2.111,14.829-5.597l13.558,13.558
                    c0.779,0.779,2.047,0.779,2.826,0l2.829-2.829
                    C55.925,53.934,55.925,52.666,55.146,51.887z 
                    M23,36c-8.284,0-15-6.716-15-15s6.716-15,15-15
                    s15,6.716,15,15S31.284,36,23,36z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-800 dark:text-gray-200 focus:outline-none text-2xl"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </button>

            {/* Community Links */}
            {user && (
              <Link
                to="/communities"
                className="text-gray-800 dark:text-gray-200 hover:underline"
              >
                Communities
              </Link>
            )}

            {/* Show 'Create Community' for Professors and Admins */}
            {user && ["professor", "admin"].includes(user.role) && (
              <Link
                to="/communities/create"
                className="text-gray-800 dark:text-gray-200 hover:underline"
              >
                Create Community
              </Link>
            )}

            {/* User Avatar */}
            <div className="relative">
              <button onClick={handleSignOut} className="focus:outline-none">
                <Avatar
                  src={user?.photo}
                  alt={user?.displayName || "User Avatar"}
                  className="cursor-pointer"
                />
              </button>
              {/* Optional: Notifications Icon */}
              {user && (
                <div className="absolute top-0 right-0 mt-1 mr-1">
                  <svg
                    className="h-4 w-4 text-blue-500 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-label="Notifications"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 
                      2.032 0 0118 14.158V11a6.002 
                      6.002 0 00-4-5.659V5a2 2 0 
                      10-4 0v.341C7.67 6.165 6 
                      7.388 6 9v5.159c0 .538-.214 
                      1.055-.595 1.436L4 17h5m6 
                      0v1a3 3 0 11-6 0v-1m6 
                      0H9"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
