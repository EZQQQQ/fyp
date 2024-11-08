// /src/components/Community/CommunityAvatar.js

import React from "react";
import { Avatar } from "@mui/material";
import PropTypes from "prop-types";

const CommunityAvatar = ({ avatarUrl, name }) => {
  const initial =
    typeof name === "string" && name.length > 0
      ? name.charAt(0).toUpperCase()
      : "";

  // Construct the full avatar URL
  let fullAvatarUrl = avatarUrl;

  if (
    avatarUrl &&
    avatarUrl.startsWith("/uploads/") &&
    !avatarUrl.includes("/defaults/")
  ) {
    // User-uploaded avatar from backend
    fullAvatarUrl = `${process.env.REACT_APP_BACKEND_URL}${avatarUrl}`;
  } else {
    // Default avatar from frontend public directory
    fullAvatarUrl = avatarUrl || "/uploads/defaults/default-avatar.jpeg";
  }

  // Handle image loading errors
  const handleError = (e) => {
    e.target.onerror = null; // Prevents infinite loop
    e.target.src = "/uploads/defaults/default-avatar.jpeg";
  };

  return (
    <Avatar
      src={fullAvatarUrl}
      alt={name || "Community Avatar"}
      className="h-8 w-8"
      onError={handleError}
    >
      {initial}
    </Avatar>
  );
};

CommunityAvatar.propTypes = {
  avatarUrl: PropTypes.string,
  name: PropTypes.string.isRequired,
};

export default CommunityAvatar;
