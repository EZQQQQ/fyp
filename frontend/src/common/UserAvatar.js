// frontend/src/common/UserAvatar.js

import React from "react";
import { Avatar } from "@mui/material";
import PropTypes from "prop-types";
import config from "../config";

const DEFAULT_AVATAR_URL = `${config.S3_BASE_URL}/uploads/defaults/default-avatar-user.jpeg`;

const UserAvatar = ({ user, handleSignOut, className }) => {
  const avatarSrc = user?.profilePicture || DEFAULT_AVATAR_URL;

  const handleAvatarClick = () => {
    if (handleSignOut) {
      handleSignOut();
    }
  };

  return (
    <Avatar
      src={avatarSrc}
      alt={user?.username || user?.name || "Default Avatar"}
      className={`cursor-pointer border border-gray-300 ${className}`}
      onClick={handleSignOut ? handleAvatarClick : undefined}
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
  handleSignOut: PropTypes.func,
  className: PropTypes.string,
};

UserAvatar.defaultProps = {
  handleSignOut: null,
  className: "",
};

export default UserAvatar;
