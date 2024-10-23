import React from "react";
import "./css/Header.css";
import InboxIcon from "@mui/icons-material/Inbox";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";

function Header() {
  return (
    <header>
      <div className="header-container">
        <div className="header-left">
          <Link to="/">
            <img src={Logo} alt="KnowledgeNode Logo" className="logo" />
          </Link>
        </div>
        <div className="header-middle">
          <div className="header-search-container">
            <SearchIcon />
            <input type="text" placeholder="Search..." />
          </div>
        </div>
        <div className="header-right">
          <div className="header-right-container">
            <Avatar />
            <InboxIcon className="header-icon" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
