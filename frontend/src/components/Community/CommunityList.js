// frontend/src/components/Community/CommunityList.js

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCommunities, joinCommunity } from "../../features/communitySlice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // Ensure correct import
import "react-toastify/dist/ReactToastify.css";

const CommunityList = () => {
  const dispatch = useDispatch();
  const { communities, loading, error } = useSelector(
    (state) => state.communities
  );
  const user = useSelector((state) => state.user.user); // Assuming user state

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
      <p className="text-gray-500 dark:text-gray-400">Loading communities...</p>
    );
  }

  if (error) {
    return <p className="text-red-500 dark:text-red-400">Error: {error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Communities
      </h2>
      {communities.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No communities available.
        </p>
      ) : (
        <ul className="space-y-4">
          {communities.map((community) => (
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
                {!community.members.includes(user?._id) &&
                  user?.role === "student" && (
                    <button
                      onClick={() => handleJoin(community._id)}
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
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommunityList;
