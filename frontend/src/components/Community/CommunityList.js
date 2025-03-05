// frontend/src/components/Community/CommunityList.js

import React, { useEffect, useState } from "react";
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
import CustomDialog from "../Modal/CustomDialog";

const CommunityList = ({ isTileView = false }) => {
  const dispatch = useDispatch();
  const communities = useSelector(selectCommunities);
  const loading = useSelector((state) => state.communities.loading);
  const error = useSelector((state) => state.communities.error);
  const user = useSelector((state) => state.user.user);

  // Check if user is a professor
  const isProfessor = user && (user.role === "professor" || user.role === "admin");

  // State for the global join code input (visible in Explore Communities page)
  const [globalJoinCode, setGlobalJoinCode] = useState("");

  // State for modal join dialog
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    dispatch(fetchCommunities());
  }, [dispatch]);

  // Updated handleJoin to accept a communityId and the provided code
  const handleJoin = async (communityId, code = "") => {
    try {
      // For professors, we'll pass an empty code or a special value that the backend recognizes
      await dispatch(joinCommunity({ communityId, code })).unwrap();
      toast.success("Joined community successfully!");
    } catch (err) {
      console.error("Error joining community:", err);
      toast.error(err || "Failed to join community.");
    }
  };

  // Direct join for professors (no code required)
  const handleProfessorJoin = (communityId) => {
    handleJoin(communityId, "professor"); // You could use empty string or a special value recognized by your backend
  };

  // Handler for joining a community using the global code input field
  const handleGlobalJoin = () => {
    // Find the community that has a matching communityCode (case sensitive)
    const community = communities.find(
      (c) => c.communityCode === globalJoinCode
    );
    if (!community) {
      toast.error("Invalid community code.");
      return;
    }
    // Optional: Check if user is already a member
    const isMember = community.members.some(
      (member) => member._id === user?._id
    );
    if (isMember) {
      toast.info("You are already a member of this community.");
      return;
    }
    handleJoin(community._id, globalJoinCode);
  };

  // Open the join modal for a specific community
  const openJoinModal = (communityId) => {
    setSelectedCommunityId(communityId);
    setJoinModalOpen(true);
  };

  const closeJoinModal = () => {
    setJoinModalOpen(false);
    setJoinCode("");
    setSelectedCommunityId(null);
  };

  const handleModalSubmit = () => {
    if (joinCode) {
      handleJoin(selectedCommunityId, joinCode);
      closeJoinModal();
    } else {
      toast.error("Please enter a community code.");
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
    return (
      <div className="text-red-500 dark:text-red-400">Error: {error}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-2 overflow-x-hidden">
      {isTileView ? (
        // Render the header with the global join code input for Explore Communities
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Explore Communities
          </h2>
          {!isProfessor && (
            <div className="flex">
              <input
                type="text"
                placeholder="Enter community code"
                value={globalJoinCode}
                onChange={(e) => setGlobalJoinCode(e.target.value)}
                className="border border-gray-300 rounded-l-md px-3 py-2"
              />
              <button
                onClick={handleGlobalJoin}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
              >
                Join by Code
              </button>
            </div>
          )}
        </div>
      ) : (
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Communities
        </h2>
      )}

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
                // When the join button is clicked in a tile,
                // use different join methods based on role
                handleJoin={() =>
                  isProfessor
                    ? handleProfessorJoin(community._id)
                    : openJoinModal(community._id)
                }
                isProfessor={isProfessor}
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
                      {!isMember && (
                        <>
                          {isProfessor ? (
                            <button
                              onClick={() => handleProfessorJoin(community._id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                            >
                              Join Directly
                            </button>
                          ) : user.role === "student" && (
                            <button
                              onClick={() => openJoinModal(community._id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                            >
                              Join
                            </button>
                          )}
                        </>
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

      {/* Custom join modal dialog - only shown for students */}
      <CustomDialog isOpen={joinModalOpen} onClose={closeJoinModal} size="sm">
        <h3 className="text-lg font-bold mb-4">Enter Community Code</h3>
        <input
          type="text"
          placeholder="Community Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={closeJoinModal}
            className="mr-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleModalSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Join
          </button>
        </div>
      </CustomDialog>
    </div>
  );
};

export default CommunityList;