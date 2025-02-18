// frontend/src/components/Header/Header.js

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchNotifications } from "../../features/notificationSlice";

import SearchBar from "../Search/Searchbar";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import DarkModeSwitcher from "./DarkModeSwitcher";

import LogoLight from "../../assets/logo-downsized.png";
import LogoDark from "../../assets/logo-downsized-dark.png";

import { selectUser } from "../../features/userSlice";

const Header = (props) => {
  // Receive sidebarOpen and setSidebarOpen for toggling on mobile, as well as dark mode props.
  const { sidebarOpen, setSidebarOpen, darkMode, setDarkMode } = props;
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications(user._id));
    }
  }, [user, dispatch]);


  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const observer = new MutationObserver(() => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTheme(isDarkMode ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    // The header is fixed, offset to the right on large screens (to account for a fixed sidebar)
    <header className="fixed top-0 left-0 right-0 lg:left-72 z-50 bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex items-center justify-between px-4 py-2 md:px-6 2xl:px-11">
        {/* Left Section: Hamburger Toggle and Mobile Logo */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen && setSidebarOpen(!sidebarOpen);
            }}
            className="z-50 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "!w-full delay-300"
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "delay-400 !w-full"
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "!w-full delay-500"
                    }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "!h-0 !delay-[0]"
                    }`}
                ></span>
                <span
                  className={`absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black delay-400 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && "!h-0 !delay-200"
                    }`}
                ></span>
              </span>
            </span>
          </button>
          <Link className="block flex-shrink-0" to="/">
            <img
              src={theme === "dark" ? LogoDark : LogoLight}
              alt="Logo"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Center Section: Search Bar (centered) */}
        {user && (
          <div className="hidden lg:block flex-1 text-center">
            <SearchBar />
          </div>
        )}

        {/* Right Section: For Mobile, show search bar with controls flushed right; for desktop, show dark mode, notifications, and user menu */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-4">
          {/* On mobile, show search bar flush right */}
          {user && (
            <div className="block lg:hidden">
              <SearchBar />
            </div>
          )}
          <ul className="flex items-center gap-3 sm:gap-4 md:gap-4">
            <li className="flex-shrink-0">
              <DarkModeSwitcher />
            </li>
            <li className="flex-shrink-0">
              <DropdownNotification />
            </li>
          </ul>

          <DropdownUser user={user} />
        </div>
      </div>
    </header>
  );
};

export default Header;
