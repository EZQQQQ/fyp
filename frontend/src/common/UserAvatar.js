// /frontend/src/common/UserAvatar.js

import React from "react";
import { Avatar } from "@mui/material";
import axiosInstance from "../utils/axiosConfig";

const UserAvatar = ({ user, handleSignOut, className }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

  const avatarSrc = user?.profilePicture
    ? `${backendUrl}${user.profilePicture}`
    : "/uploads/defaults/default-avatar-user.jpeg";

  const handleAvatarClick = async () => {
    try {
      await axiosInstance.post("/auth/signout");
      handleSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Avatar
      src={avatarSrc}
      alt={user?.name || "Default Avatar"}
      className={`cursor-pointer border border-gray-300 ${className}`}
      onClick={handleAvatarClick}
    />
  );
};

export default UserAvatar;
