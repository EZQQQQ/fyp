import React, { useState } from "react";
import { Link } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import PeopleIcon from "@mui/icons-material/People";
import "./css/Sidebar.css";

function Sidebar() {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setOpen(!open);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-container">
        <div className="sidebar-options">
          {/* Home */}
          <div className="sidebar-option">
            <Link to="/" className="sidebar-link">
              <HomeIcon /> {/* Add icon next to the text */}
              Home
            </Link>
          </div>

          {/* Explore */}
          <div className="sidebar-option">
            <Link to="/explore" className="sidebar-link">
              <ExploreIcon /> {/* Add icon next to the text */}
              Explore
            </Link>
          </div>

          {/* Communities */}
          <div className="sidebar-option">
            <div
              className="sidebar-link"
              onClick={(e) => {
                e.preventDefault();
                toggleDropdown();
              }}
            >
              <PeopleIcon /> {/* Add icon next to the text */}
              Communities
              {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </div>
            {open && (
              <div className="sidebar-dropdown">{/* Community Links */}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
