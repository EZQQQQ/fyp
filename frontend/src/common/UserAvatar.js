// frontend/src/common/UserAvatar.js

import React from "react";
import { Avatar } from "@mui/material";
import PropTypes from "prop-types";
import config from "../config";

const DEFAULT_AVATAR_URL = `${config.S3_BASE_URL}/uploads/defaults/default-avatar-user.jpeg`;

const UserAvatar = ({ user, className }) => {
  const avatarSrc = user?.profilePicture || DEFAULT_AVATAR_URL;

  return (
    <Avatar
      src={avatarSrc}
      alt={user?.username || user?.name || "Default Avatar"}
      className={`cursor-pointer border border-gray-300 ${className}`}
      sx={{ width: 30, height: 30 }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_AVATAR_URL;
      }}
      loading="lazy"
    />
  );
};

UserAvatar.propTypes = {
  user: PropTypes.shape({
    profilePicture: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
};

UserAvatar.defaultProps = {
  className: "",
};

export default UserAvatar;