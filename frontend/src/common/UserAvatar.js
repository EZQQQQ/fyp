// frontend/src/common/UserAvatar.js

import React from "react";
import { Avatar } from "@mui/material";
import PropTypes from "prop-types";

const UserAvatar = ({ user, handleSignOut, className }) => {
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    "https://backend-knowledgenode.onrender.com";

  const avatarSrc = user?.profilePicture
    ? `${backendUrl}${user.profilePicture}`
    : "/uploads/defaults/default-avatar-user.jpeg";

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
        e.target.src = "/uploads/defaults/default-avatar-user.jpeg";
      }}
      loading="lazy" // Optional: improves performance by lazy loading avatars
    />
  );
};

UserAvatar.propTypes = {
  user: PropTypes.shape({
    profilePicture: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  handleSignOut: PropTypes.func, // Made optional
  className: PropTypes.string,
};

UserAvatar.defaultProps = {
  handleSignOut: null,
  className: "",
};

export default UserAvatar;
