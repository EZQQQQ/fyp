// /src/components/Community/CommunityAvatar.js

import React from "react";
import { Avatar } from "@mui/material";
import PropTypes from "prop-types";
import config from "../../config"; // Adjust the path as needed

const CommunityAvatar = ({ avatarUrl, name }) => {
  const initial =
    typeof name === "string" && name.length > 0
      ? name.charAt(0).toUpperCase()
      : "";

  // Construct the full avatar URL if needed
  const fullAvatarUrl = avatarUrl.startsWith("/")
    ? `${config.BACKEND_URL}${avatarUrl}`
    : avatarUrl;

  return (
    <Avatar
      src={fullAvatarUrl}
      alt={name || "Community Avatar"}
      className="h-8 w-8"
    >
      {initial}
    </Avatar>
  );
};

CommunityAvatar.propTypes = {
  avatarUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default CommunityAvatar;
