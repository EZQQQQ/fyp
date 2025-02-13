// frontend/src/components/Community/CommunityList.js

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCommunities,
  joinCommunity,
  selectCommunities,
} from "../../features/communitySlice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommunityCard from "./CommunityCard";

const CommunityList = ({ isTileView = false }) => {
  const dispatch = useDispatch();
  const communities = useSelector(selectCommunities);
  const loading = useSelector((state) => state.communities.loading);
  const error = useSelector((state) => state.communities.error);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    dispatch(fetchCommunities());
  }, [dispatch]);

  const handleJoin = async (communityId) => {
    try {
      await dispatch(joinCommunity(communityId)).unwrap();
      toast.success("Joined community successfully!");
    } catch (err) {
      console.error("Error joining community:", err);
      toast.error(err || "Failed to join community.");
    }
  };

  if (loading) {
    return (
      <div className="text-gray-700 dark:text-gray-200">
        Loading communities...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 overflow-x-hidden">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {isTileView ? "Explore Communities" : "Communities"}
      </h2>
      {communities.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No communities available.
        </p>
      ) : isTileView ? (
        // Tile (Grid) View
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {communities.map((community) => {
            // Check if user is a member
            const isMember = community.members.some(
              (member) => member._id === user?._id
            );

            return (
              <CommunityCard
                key={community._id}
                community={community}
                isMember={isMember}
                handleJoin={handleJoin}
              />
            );
          })}
        </div>
      ) : (
        // List View
        <ul className="space-y-4">
          {communities.map((community) => {
            // Check if user is a member
            const isMember = community.members.some(
              (member) => member._id === user?._id
            );

            return (
              <li
                key={community._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-md shadow"
              >
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
                  {user && (
                    <>
                      {!isMember && user.role === "student" && (
                        <button
                          onClick={() => handleJoin(community._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        >
                          Join
                        </button>
                      )}
                      {isMember && (
                        <span className="text-green-500 font-medium">
                          Joined
                        </span>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CommunityList;
