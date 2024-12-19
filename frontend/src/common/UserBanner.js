// frontend/src/common/UserBanner.js

import React from "react";
import PropTypes from "prop-types";
import config from "../config";

const DEFAULT_BANNER_URL = `${config.S3_BASE_URL}/uploads/defaults/default-banner.jpeg`;

const UserBanner = ({ user, handleSignOut, className }) => {
  const bannerSrc = user?.profileBanner || DEFAULT_BANNER_URL;

  const handleBannerClick = () => {
    if (handleSignOut) {
      handleSignOut();
    }
  };

  return (
    <img
      src={bannerSrc}
      alt={`${user?.username || user?.name || "User"}'s Banner`}
      className={`w-full h-full object-cover cursor-pointer ${className}`}
      onClick={handleSignOut ? handleBannerClick : undefined}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_BANNER_URL;
      }}
      loading="lazy"
    />
  );
};

UserBanner.propTypes = {
  user: PropTypes.shape({
    profileBanner: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  handleSignOut: PropTypes.func,
  className: PropTypes.string,
};

UserBanner.defaultProps = {
  handleSignOut: null,
  className: "",
};

export default UserBanner;