import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import axiosInstance from "../../utils/axiosConfig";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Modal from "../Modal/CommunitySelectModal";

function SearchBar() {
  const user = useSelector(selectUser);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [communities, setCommunities] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

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
          console.warn("No communities found or incorrect response structure.");
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

  useEffect(() => {
    if (typeof document !== "undefined") {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleCommunitySelect = (communityId) => {
    setSelectedCommunity(communityId);
    setDropdownOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (isMobile && selectedCommunity === "all") {
      setShowModal(true);
    } else {
      navigate(
        `/search?query=${encodeURIComponent(searchTerm)}&community=${selectedCommunity}`
      );
    }
  };

  const handleMobileSearchClick = () => {
    if (isMobile && selectedCommunity === "all") {
      setShowModal(true);
    }
  };

  const handleModalSelect = (communityId) => {
    setSelectedCommunity(communityId);
    setShowModal(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (loading) {
    return <div className="w-full px-4">Loading communities...</div>;
  }

  return (
    <div className="w-full px-4">
      {showModal && (
        <Modal
          communities={communities}
          onClose={() => setShowModal(false)}
          onSelect={handleModalSelect}
        />
      )}

      <form onSubmit={handleSearchSubmit}>
        <div className="flex items-center space-x-2">
          {!isMobile && (
            <div className="relative" ref={dropdownRef}>
              <button
                id="dropdown-button"
                onClick={toggleDropdown}
                className="flex items-center justify-between p-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full focus:outline-none w-40 md:w-48"
                type="button"
                aria-expanded={dropdownOpen}
                aria-controls="communities-dropdown"
              >
                <div className="flex items-center space-x-1">
                  <PeopleIcon className="text-sm" />
                  <span className="truncate">
                    {selectedCommunity === "all"
                      ? "All Communities"
                      : communities.find((c) => c._id === selectedCommunity)
                          ?.name || "Select Community"}
                  </span>
                </div>
                {dropdownOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              </button>
              {dropdownOpen && (
                <div
                  id="communities-dropdown"
                  className="absolute mt-2 w-40 md:w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-lg z-20 rounded-lg"
                >
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleCommunitySelect("all")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg"
                      >
                        All Communities
                      </button>
                    </li>
                    {communities.map((community) => (
                      <li key={community._id}>
                        <button
                          type="button"
                          onClick={() => handleCommunitySelect(community._id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          {community.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 relative">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={handleMobileSearchClick}
              ref={searchInputRef}
              className="w-full p-2.5 pl-4 pr-10 text-sm text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
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
          </div>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
