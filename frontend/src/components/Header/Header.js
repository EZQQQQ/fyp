import React from "react";
import "./css/Header.css";
import InboxIcon from "@mui/icons-material/Inbox";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { selectUser, logout } from "../../features/userSlice";
import { signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../../config/firebase-config";

function Header() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (user) {
      signOut(auth)
        .then(() => {
          dispatch(logout()); // Use logout action
          console.log("User signed out");
          navigate("/auth"); // Redirect to auth page after logout
        })
        .catch((error) => {
          console.error("Sign-out Error:", error);
        });
    } else {
      navigate("/auth"); // Redirect unauthenticated users to auth page
    }
  };

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
            <span onClick={() => auth.signOut()}>
              <Avatar
                src={user?.photo}
                alt={user?.displayName}
                style={{ cursor: "pointer" }}
              />
            </span>
            {user && <InboxIcon className="header-icon" />}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
