// frontend/src/components/Header/Header.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "../../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase-config";
import SearchBar from "../Search/Searchbar";
import UserAvatar from "../../common/UserAvatar";

// Importing Images
import LogoLight from "../../assets/logo.png"; // Web light mode
import LogoMobileLight from "../../assets/logo-downsized.png"; // Mobile light mode
import LogoDark from "../../assets/logo-dark.png"; // Web dark mode
import LogoMobileDark from "../../assets/logo-downsized-dark.png"; // Mobile dark mode

function Header({ darkMode, setDarkMode, toggleSidebar }) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle user sign-out
  const handleSignOut = () => {
    if (user) {
      signOut(auth)
        .then(() => {
          dispatch(logout());
          navigate("/auth");
        })
        .catch((error) => {
          console.error("Sign-out Error:", error);
        });
    } else {
      navigate("/auth");
    }
  };

  // Determine the appropriate logo based on dark mode
  const getLogo = () => {
    if (darkMode) {
      return {
        desktop: LogoDark,
        mobile: LogoMobileDark,
      };
    }
    return {
      desktop: LogoLight,
      mobile: LogoMobileLight,
    };
  };

  const { desktop: LogoDesktop, mobile: LogoMobileImg } = getLogo();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Menu Icon (Visible on mobile) */}
          <div className="flex md:hidden">
            <button
              className="text-gray-800 dark:text-gray-200 focus:outline-none text-2xl mr-4"
              onClick={toggleSidebar}
              aria-label="Toggle Sidebar Menu"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            {/* Desktop Logo */}
            <Link to="/" className="hidden md:block">
              <img
                src={LogoDesktop}
                alt="KnowledgeNode Logo"
                className="h-8 w-auto"
              />
            </Link>
            {/* Mobile Logo */}
            <Link to="/" className="block md:hidden">
              <img
                src={LogoMobileImg}
                alt="KnowledgeNode Logo"
                className="h-6 w-auto"
              />
            </Link>
          </div>

          {/* Conditionally Render Search Bar and Right Side Only If User is Authenticated */}
          {user && (
            <>
              {/* Search Bar */}
              <SearchBar />

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
                {/* Notification Icon */}
                <IconButton
                  aria-label="View Notifications"
                  className="text-gray-800 dark:text-gray-200"
                  size="large"
                >
                  <NotificationsIcon fontSize="medium" />
                </IconButton>
                {/* User Avatar */}
                <div className="relative">
                  <UserAvatar
                    user={user}
                    handleSignOut={handleSignOut}
                    className="h-8 w-8"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
