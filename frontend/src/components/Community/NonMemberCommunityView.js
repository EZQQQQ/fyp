// frontend/src/components/Community/NonMemberCommunityView.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import communityService from "../../services/communityService";
import { fetchUserCommunities } from "../../features/communitySlice";
import CommunityAvatar from "./CommunityAvatar";
import CustomDialog from "../Modal/CustomDialog";

function NonMemberCommunityView({ community, communityId, onJoinSuccess }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Join modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleJoin = async () => {
    try {
      if (!joinCode) {
        toast.error("Please enter a community code.");
        return;
      }

      await communityService.joinCommunity({ communityId, code: joinCode });
      toast.success("Successfully joined the community!");
      dispatch(fetchUserCommunities());
      onJoinSuccess();

    } catch (error) {
      console.error("Error joining community:", error);
      toast.error(error.response?.data?.message || "Failed to join community.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-6 space-x-4">
          <CommunityAvatar
            avatarUrl={community.avatar}
            name={community.name}
            className="h-12 w-12 mr-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {community.name}
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Description
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {community.description || "No description provided for this community."}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Created by
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {community.createdBy?.name || "Unknown"}
          </p>
        </div>

        <div className="border-t pt-6 mt-6">
          <p className="text-red-500 font-medium mb-4">
            You are not a member of this community
          </p>
          <button
            onClick={() => setJoinModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Join Community
          </button>
        </div>
      </div>

      {/* Join Modal */}
      <CustomDialog isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} size="sm">
        <h3 className="text-lg font-bold mb-4">Enter Community Code</h3>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Please enter the community code to join {community.name}.
        </p>
        <input
          type="text"
          placeholder="Community Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={() => setJoinModalOpen(false)}
            className="mr-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Join
          </button>
        </div>
      </CustomDialog>
    </div>
  );
}

export default NonMemberCommunityView;