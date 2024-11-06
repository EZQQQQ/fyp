// /frontend/src/components/KnowledgeNode/Sidebar.js

import React, { useState, useEffect } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SidebarLink from "./SidebarLink";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../features/userSlice";
import {
  fetchUserCommunities,
  selectUserCommunities,
} from "../../features/communitySlice";
import CommunityAvatar from "../Community/CommunityAvatar";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = useSelector(selectUser);
  const userCommunities = useSelector(selectUserCommunities);
  const dispatch = useDispatch();

  // Fetch user's communities only
  useEffect(() => {
    if (user) {
      dispatch(fetchUserCommunities());
    }
  }, [dispatch, user]);

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
                <span className="font-medium">My Communities</span>
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
                {/* "+ Create a Community" Link for Professors and Admins */}
                {user &&
                  (user.role === "admin" || user.role === "professor") && (
                    <SidebarLink
                      to="/communities/create"
                      onClick={handleCommunityClick}
                    >
                      + Create a Community
                    </SidebarLink>
                  )}

                {/* Dynamically Render User's Community Links */}
                {Array.isArray(userCommunities) &&
                userCommunities.length > 0 ? (
                  userCommunities.map((community) => (
                    <SidebarLink
                      key={community._id}
                      to={`/communities/${community._id}`}
                      onClick={handleCommunityClick}
                    >
                      <div className="flex items-center space-x-2">
                        <CommunityAvatar
                          avatarUrl={community.avatar}
                          name={community.name}
                        />
                        <span>{community.name}</span>
                      </div>
                    </SidebarLink>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    You are not part of any communities.
                  </span>
                )}
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
