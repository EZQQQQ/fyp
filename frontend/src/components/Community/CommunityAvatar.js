// frontend/src/components/KnowledgeNode/CommunityAvatar.js

import React from "react";
import { Avatar } from "@mui/material";
import PropTypes from "prop-types";

function CommunityAvatar({ avatarUrl, name }) {
  return (
    <Avatar
      src={avatarUrl || "/uploads/defaults/default-avatar.jpeg"}
      alt={name || "Community Avatar"}
      className="h-6 w-6"
    />
  );
}

CommunityAvatar.propTypes = {
  avatarUrl: PropTypes.string,
  name: PropTypes.string.isRequired,
};

export default CommunityAvatar;
