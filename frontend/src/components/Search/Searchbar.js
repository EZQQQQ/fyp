// frontend/src/components/Search/SearchBar.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import axiosInstance from "../../utils/axiosConfig";

import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function SearchBar() {
  const user = useSelector(selectUser);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Shared state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [communities, setCommunities] = useState([]);
  const [communityFilter, setCommunityFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Desktop: dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Mobile: modal open state
  const [showMobileModal, setShowMobileModal] = useState(false);

  const dropdownRef = useRef(null);
  const mobileModalRef = useRef(null);

  // Determine screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch communities when user is available
  useEffect(() => {
    const fetchCommunities = async () => {
      if (!user) {
        setCommunities([]);
        return;
      }
      setLoading(true);
      try {
        const response = await axiosInstance.get("/communities/user");
        if (response.data.status && Array.isArray(response.data.communities)) {
          setCommunities(response.data.communities);
        } else {
          setCommunities([]);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
        setCommunities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, [user]);

  // For desktop: close community dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (!isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  // For mobile: close modal if clicking outside its content
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileModalRef.current && !mobileModalRef.current.contains(event.target)) {
        setShowMobileModal(false);
      }
    };
    if (isMobile && showMobileModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, showMobileModal]);

  // Filter communities based on communityFilter text
  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(communityFilter.toLowerCase())
  );

  const handleCommunitySelect = (communityId) => {
    setSelectedCommunity(communityId);
    setDropdownOpen(false);
    setCommunityFilter("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(
      `/search?query=${encodeURIComponent(searchTerm)}&community=${selectedCommunity}`
    );
    // If mobile, close modal upon submission.
    if (isMobile) setShowMobileModal(false);
  };

  // ----- Desktop Rendering -----
  if (!isMobile) {
    return (
      <div className="flex items-center space-x-2">
        {/* Community Selector with filter input at top of dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full focus:outline-none"
          >
            <div className="flex items-center space-x-1">
              <PeopleIcon className="text-sm" />
              <span className="hidden sm:inline-block truncate">
                {selectedCommunity === "all"
                  ? "All Communities"
                  : communities.find((c) => c._id === selectedCommunity)?.name || "Select"}
              </span>
            </div>
            {dropdownOpen ? (
              <ArrowDropUpIcon className="text-sm" />
            ) : (
              <ArrowDropDownIcon className="text-sm" />
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-500 shadow-lg rounded-lg z-20">
              {/* Filter input at the top of the dropdown */}
              <div className="p-2">
                <input
                  type="text"
                  value={communityFilter}
                  onChange={(e) => setCommunityFilter(e.target.value)}
                  placeholder="Type to filter..."
                  className="w-full p-1 text-xs border border-gray-100 rounded
                       dark:bg-gray-600 dark:text-gray-200"
                />
              </div>
              <ul className="py-1 max-h-60 overflow-y-auto">
                <li>
                  <button
                    type="button"
                    onClick={() => handleCommunitySelect("all")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg text-xs"
                  >
                    All Communities
                  </button>
                </li>
                {filteredCommunities.map((community) => (
                  <li key={community._id}>
                    <button
                      type="button"
                      onClick={() => handleCommunitySelect(community._id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs"
                    >
                      {community.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 md:w-96 lg:w-115">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 text-sm text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white
               border border-gray-100 dark:border-gray-500 rounded-full
               focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="Search questions..."
            required
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-3
               text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
               focus:outline-none"
          >
            <SearchIcon className="w-5 h-5" />
            <span className="sr-only">Search</span>
          </button>
        </form>
      </div>
    );
  }

  // ----- Mobile Rendering -----
  // On mobile, show only a search icon in the header.
  // When tapped, open a modal-like overlay that forces the user to first select a community.
  return (
    <div>
      <button
        type="button"
        onClick={() => setShowMobileModal(true)}
        className="p-2 text-gray-700 dark:text-gray-200 focus:outline-none"
      >
        <SearchIcon className="w-5 h-5" />
      </button>
      {showMobileModal && (
        <div
          className="absolute top-12 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-500 shadow-lg rounded-lg p-4 z-50"
          ref={mobileModalRef}
        >
          {/* Community Selection */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">
              Select Community
            </label>
            <input
              type="text"
              value={communityFilter}
              onChange={(e) => setCommunityFilter(e.target.value)}
              placeholder="Type community name..."
              className="w-full p-1 text-xs rounded mt-1 border border-gray-100 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400"
            />
            <div className="max-h-40 overflow-y-auto mt-1 border border-gray-100 rounded">
              <button
                type="button"
                onClick={() => setSelectedCommunity("all")}
                className="w-full text-left px-2 py-1 hover:bg-gray-100 text-xs"
              >
                All Communities
              </button>
              {communities
                .filter((c) =>
                  c.name.toLowerCase().includes(communityFilter.toLowerCase())
                )
                .map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setSelectedCommunity(c._id)}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100 text-xs break-words"
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </div>
          {/* Show the selected community (in a subtle grey-bordered box) */}
          <div className="mb-2 p-1 border border-gray-100 rounded break-words text-xs text-gray-700 dark:text-gray-200">
            {selectedCommunity === "all"
              ? "All Communities"
              : communities.find((c) => c._id === selectedCommunity)?.name ||
              "Select Community"}
          </div>
          {/* Search Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">
              Search Questions
            </label>
            <form onSubmit={handleSearchSubmit} className="relative mt-1">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 text-sm text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Search questions..."
                required
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              >
                <SearchIcon className="w-5 h-5" />
                <span className="sr-only">Search</span>
              </button>
            </form>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileModal(false)}
            className="mt-2 text-xs text-blue-500"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
