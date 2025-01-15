// frontend/src/components/KnowledgeNode/CommunityAvatar.js

import React from "react";
import { Avatar } from "@mui/material";
import PropTypes from "prop-types";
import config from "../../config";

const DEFAULT_AVATAR_URL = `${config.S3_BASE_URL}/uploads/defaults/default-avatar.jpeg`;

function CommunityAvatar({ avatarUrl, name }) {
  const src = avatarUrl || DEFAULT_AVATAR_URL;

  return (
    <Avatar
      src={src}
      alt={name || "Community Avatar"}
      sx={{ width: 30, height: 30 }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_AVATAR_URL;
      }}
    />
  );
}

CommunityAvatar.propTypes = {
  avatarUrl: PropTypes.string,
  name: PropTypes.string.isRequired,
};

export default CommunityAvatar;