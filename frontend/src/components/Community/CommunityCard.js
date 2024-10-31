// /frontend/src/components/Community/CommunityCard.js

import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { joinCommunity } from "../../features/communitySlice";
import { toast } from "react-toastify";

const CommunityCard = ({ community }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const handleJoin = async () => {
    try {
      await dispatch(joinCommunity(community._id)).unwrap();
      toast.success("Joined community successfully!");
    } catch (err) {
      console.error("Error joining community:", err);
      toast.error(err || "Failed to join community.");
    }
  };

  return (
    <li className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
      <div className="flex justify-between items-center">
        <div>
          <Link
            to={`/communities/${community._id}`}
            className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {community.name}
          </Link>
          <p className="text-gray-700 dark:text-gray-300">
            {community.description}
          </p>
        </div>
        {!community.members.includes(user?._id) && user?.role === "student" && (
          <button
            onClick={handleJoin}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Join
          </button>
        )}
        {community.members.includes(user?._id) && (
          <span className="text-green-500 font-medium">Joined</span>
        )}
      </div>
    </li>
  );
};

export default CommunityCard;
