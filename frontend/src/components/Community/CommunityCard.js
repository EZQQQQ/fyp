// /frontend/src/components/Community/CommunityCard.js

import React from "react";
import { Link } from "react-router-dom";
import CommunityAvatar from "./CommunityAvatar";

const CommunityCard = ({ community, isMember, handleJoin }) => {
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

  const communityName = community.name || "Unnamed Community";
  const creatorName = community.createdBy?.name || "Unknown";

  // Handle creator's avatar
  let creatorAvatar = community.createdBy?.profilePicture;

  if (creatorAvatar) {
    // User-uploaded avatar from backend
    creatorAvatar = `${backendUrl}${creatorAvatar}`;
  } else {
    // Default avatar from frontend public directory
    creatorAvatar = "/uploads/defaults/default-avatar-user.jpeg";
  }

  // Handle community's avatar
  let communityAvatar = community.avatar;

  if (communityAvatar) {
    // User-uploaded avatar from backend
    communityAvatar = `${backendUrl}${communityAvatar}`;
  } else {
    // Default avatar from frontend public directory
    communityAvatar = "/uploads/defaults/default-avatar.jpeg";
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Community Details */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Community Name and Avatar */}
        <div className="flex items-center mb-2">
          <CommunityAvatar avatarUrl={communityAvatar} name={communityName} />
          <Link
            to={`/communities/${community._id}`}
            className="ml-2 text-lg sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {communityName}
          </Link>
        </div>

        {/* Community Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-3">
          {community.description || "No description provided."}
        </p>

        {/* Community Creator */}
        {community.createdBy && (
          <div className="flex items-center mb-4">
            <CommunityAvatar avatarUrl={creatorAvatar} name={creatorName} />
            <span className="ml-2 text-sm sm:text-xs text-gray-700 dark:text-gray-300">
              Created by {creatorName}
            </span>
          </div>
        )}

        {/* Join Button */}
        {!isMember ? (
          <button
            onClick={() => handleJoin(community._id)}
            className="mt-auto bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring focus:ring-green-300 transition-colors duration-200"
          >
            Join
          </button>
        ) : (
          <span className="mt-auto inline-block bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            Joined
          </span>
        )}
      </div>
    </div>
  );
};

export default CommunityCard;
