// /frontend/src/components/KnowledgeNode/Sidebar.js

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SidebarLink from "./SidebarLink";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleCommunityClick = () => {
    closeSidebar();
    setDropdownOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Toggle Button */}
      <div className="md:hidden flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4">
        <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Menu
        </h1>
        <button onClick={toggleSidebar} className="focus:outline-none">
          {sidebarOpen ? (
            <CloseIcon className="text-gray-700 dark:text-gray-200" />
          ) : (
            <MenuIcon className="text-gray-700 dark:text-gray-200" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:inset-auto transition-transform duration-200 ease-in-out bg-gray-100 dark:bg-gray-800 w-64 p-4 z-50`}
      >
        <div className="flex flex-col space-y-2">
          {/* Home */}
          <SidebarLink to="/" icon={HomeIcon} onClick={closeSidebar}>
            Home
          </SidebarLink>

          {/* Explore */}
          <SidebarLink to="/explore" icon={ExploreIcon} onClick={closeSidebar}>
            Explore
          </SidebarLink>

          {/* Communities */}
          <div className="flex flex-col">
            <button
              onClick={toggleDropdown}
              className={`flex items-center justify-between p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 w-full focus:outline-none ${
                dropdownOpen
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-200"
              }`}
              aria-expanded={dropdownOpen}
              aria-controls="communities-dropdown"
            >
              <div className="flex items-center">
                <PeopleIcon className="mr-2" />
                <span className="font-medium">Communities</span>
              </div>
              {dropdownOpen ? (
                <ArrowDropUpIcon className="text-gray-700 dark:text-gray-200" />
              ) : (
                <ArrowDropDownIcon className="text-gray-700 dark:text-gray-200" />
              )}
            </button>
            {dropdownOpen && (
              <div
                id="communities-dropdown"
                className="ml-6 mt-2 flex flex-col space-y-1 transition-all duration-300 ease-in-out"
              >
                {/* Community Links */}
                <SidebarLink
                  to="/community/reactjs"
                  onClick={handleCommunityClick}
                >
                  ReactJS
                </SidebarLink>
                <SidebarLink
                  to="/community/javascript"
                  onClick={handleCommunityClick}
                >
                  JavaScript
                </SidebarLink>
                {/* Add more communities as needed */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}

export default Sidebar;
