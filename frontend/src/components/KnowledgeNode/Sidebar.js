// frontend/src/components/KnowledgeNode/Sidebar.js

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
import { Button } from "@mui/material";
import PlusIcon from "@mui/icons-material/Add";

function Sidebar({ sidebarOpen, setSidebarOpen, openCreateCommunityModal }) {
  const user = useSelector(selectUser);
  const userCommunities = useSelector(selectUserCommunities);
  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  if (!user) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-16 inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-gray-100 dark:bg-gray-800 transform 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-200 ease-in-out 
        md:translate-x-0 md:static md:inset-auto
      `}
    >
      <div className="flex flex-col h-full p-4">
        {/* Close button for mobile */}
        <div className="flex justify-end md:hidden">
          <button
            onClick={closeSidebar}
            className="text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            {/* Close Icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 mt-4">
          <div className="flex flex-col space-y-2">
            {/* Home */}
            <SidebarLink to="/" icon={HomeIcon} onClick={closeSidebar}>
              Home
            </SidebarLink>

            {/* Explore */}
            <SidebarLink
              to="/explore"
              icon={ExploreIcon}
              onClick={closeSidebar}
            >
              Explore
            </SidebarLink>

            {/* Communities */}
            <div className="flex flex-col mt-4">
              <button
                onClick={toggleDropdown}
                className={`flex items-center justify-between p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 w-full focus:outline-none ${dropdownOpen
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
                  {(user.role === "admin" || user.role === "professor") && (
                    <Button
                      onClick={() => {
                        openCreateCommunityModal(); // Open the modal
                        closeSidebar(); // Optional: Close the sidebar
                      }}
                      variant="text"
                      className="flex items-center justify-start w-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      startIcon={<PlusIcon className="h-5 w-5 mr-2" />}
                    >
                      Create Community
                    </Button>
                  )}

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
      </div>
    </div>
  );
}

export default Sidebar;
