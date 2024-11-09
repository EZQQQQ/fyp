// /frontend/src/components/KnowledgeNode/Sidebar.js

import React, { useState, useEffect } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import PeopleIcon from "@mui/icons-material/People";
import SidebarLink from "./SidebarLink";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../features/userSlice";
import {
  fetchUserCommunities,
  selectUserCommunities,
} from "../../features/communitySlice";
import CommunityAvatar from "../Community/CommunityAvatar";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const user = useSelector(selectUser);
  const userCommunities = useSelector(selectUserCommunities);
  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch user's communities only
  useEffect(() => {
    if (user) {
      dispatch(fetchUserCommunities());
    }
  }, [dispatch, user]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setDropdownOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-16 bottom-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out bg-gray-100 dark:bg-gray-800 w-64 p-4 z-40 overflow-y-auto`}
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
                      onClick={closeSidebar}
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
                      onClick={closeSidebar}
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
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Sidebar;
