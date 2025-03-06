// frontend/src/components/KnowledgeNode/Sidebar.js

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  Explore as ExploreIcon,
  People as PeopleIcon,
  Add as PlusIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../features/userSlice";
import {
  fetchUserCommunities,
  selectUserCommunities,
} from "../../features/communitySlice";
import SidebarLink from "./SidebarLink";
import CommunityAvatar from "../Community/CommunityAvatar";
import LogoDark from "../../assets/logo-dark.png";
import ReportIcon from '@mui/icons-material/Report';

const CommunityLinks = ({ communities, closeSidebar }) => (
  <>
    {communities.map((community) => (
      <SidebarLink
        key={community._id}
        to={`/communities/${community._id}`}
        onClick={closeSidebar}
      >
        <div className="flex items-center space-x-2">
          <CommunityAvatar avatarUrl={community.avatar} name={community.name} />
          <span>{community.name}</span>
        </div>
      </SidebarLink>
    ))}
  </>
);

function Sidebar({ sidebarOpen, setSidebarOpen, openCreateCommunityModal }) {
  const user = useSelector(selectUser);
  const userCommunities = useSelector(selectUserCommunities);
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const triggerRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserCommunities());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !triggerRef.current?.contains(e.target) &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeSidebar = () => {
    setSidebarOpen(false);
    setDropdownOpen(false);
  };

  if (!user) return null;

  return (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 top-0 z-9999 flex h-screen w-72 flex-col overflow-y-auto bg-black dark:bg-boxdark transition-transform duration-300 ease-linear
        ${sidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}
        lg:translate-x-0 lg:pointer-events-auto`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link to="/" onClick={closeSidebar}>
          <img src={LogoDark} alt="Logo" className="h-10 w-auto" />
        </Link>
        <button
          ref={triggerRef}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden text-bodydark1 dark:text-bodydark2"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
          >
            <path d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <SidebarLink to="/" icon={HomeIcon} onClick={closeSidebar}>
                  Home
                </SidebarLink>
              </li>

              <li>
                <SidebarLink
                  to="/explore"
                  icon={ExploreIcon}
                  onClick={closeSidebar}
                >
                  Explore
                </SidebarLink>
              </li>

              <li>
                <SidebarLink
                  to="/bookmark"
                  icon={BookmarkIcon}
                  onClick={closeSidebar}
                >
                  Bookmarks
                </SidebarLink>
              </li>

              {(user.role === 'admin' || user.role === 'professor') && (
                <li>
                  <SidebarLink
                    to="/reports"
                    icon={ReportIcon}
                    onClick={closeSidebar}
                  >
                    Reported Content
                  </SidebarLink>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              COMMUNITIES
            </h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <button
                  onClick={toggleDropdown}
                  className={`flex w-full items-center justify-between rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${dropdownOpen && "bg-graydark dark:bg-meta-4"
                    }`}
                  aria-expanded={dropdownOpen}
                  aria-controls="communities-dropdown"
                >
                  <div className="flex items-center gap-2.5">
                    <PeopleIcon />
                    <span>My Communities</span>
                  </div>
                  {dropdownOpen ? (
                    <svg
                      className="fill-current rotate-180"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.41076 6.91073C4.7362 6.5853 5.26384 6.5853 5.58928 6.91073L10 11.3215L14.4108 6.91073C14.7362 6.5853 15.2638 6.5853 15.5893 6.91073C15.9147 7.23617 15.9147 7.76381 15.5893 8.08924L10.5893 13.0892C10.2638 13.4147 9.7362 13.4147 9.41076 13.0892L4.41076 8.08924C4.08532 7.76381 4.08532 7.23617 4.41076 6.91073Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.41076 6.91073C4.7362 6.5853 5.26384 6.5853 5.58928 6.91073L10 11.3215L14.4108 6.91073C14.7362 6.5853 15.2638 6.5853 15.5893 6.91073C15.9147 7.23617 15.9147 7.76381 15.5893 8.08924L10.5893 13.0892C10.2638 13.4147 9.7362 13.4147 9.41076 13.0892L4.41076 8.08924C4.08532 7.76381 4.08532 7.23617 4.41076 6.91073Z"
                      />
                    </svg>
                  )}
                </button>
              </li>
              {dropdownOpen && (
                <div
                  id="communities-dropdown"
                  className="ml-6 mt-2 flex flex-col space-y-2 transition-all duration-300 ease-in-out"
                >
                  {(user.role === "admin" || user.role === "professor") && (
                    <Button
                      onClick={() => {
                        openCreateCommunityModal();
                        closeSidebar();
                      }}
                      variant="text"
                      className="flex items-center justify-start w-full text-bodydark1 dark:text-bodydark2 hover:bg-graydark dark:hover:bg-meta-4 gap-2"
                      startIcon={<PlusIcon />}
                    >
                      Create Community
                    </Button>
                  )}
                  {Array.isArray(userCommunities) && userCommunities.length > 0 ? (
                    <CommunityLinks
                      communities={userCommunities}
                      closeSidebar={closeSidebar}
                    />
                  ) : (
                    <span className="text-bodydark2 text-sm">
                      You are not part of any communities.
                    </span>
                  )}
                </div>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
