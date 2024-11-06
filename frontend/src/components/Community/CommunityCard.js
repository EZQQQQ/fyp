// /frontend/src/components/Community/CommunityCard.js

import React from "react";
import { Link } from "react-router-dom";
import CommunityAvatar from "./CommunityAvatar"; // Adjust the path
import { toast } from "react-toastify";
import config from "../../config"; // Adjust the path as needed

const CommunityCard = ({ community, isMember, handleJoin }) => {
  const backendUrl = config.BACKEND_URL;

  const communityName = community.name || "Unnamed Community";
  const creatorName = community.createdBy?.name || "Unknown";

  const creatorAvatar = community.createdBy?.profilePicture
    ? community.createdBy.profilePicture.startsWith("http")
      ? community.createdBy.profilePicture
      : `${backendUrl}${community.createdBy.profilePicture}`
    : `${backendUrl}/uploads/defaults/default-avatar-user.jpeg`;

  const communityAvatar =
    community.avatar && community.avatar !== ""
      ? community.avatar.startsWith("http")
        ? community.avatar
        : `${backendUrl}${community.avatar}`
      : `${backendUrl}/uploads/defaults/default-avatar.jpeg`;

  console.log("Community Avatar:", communityAvatar);
  console.log("Creator Avatar:", creatorAvatar);

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
        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
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
