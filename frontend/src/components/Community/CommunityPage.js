import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import communityService from "../../services/communityService";
import { selectUser } from "../../features/userSlice";
import { ChatSessionProvider } from "../CommunityChat/ChatSessionProvider";

// Components
import MemberCommunityView from "./MemberCommunityView";
import NonMemberCommunityView from "./NonMemberCommunityView";

function CommunityPage() {
  const { id } = useParams(); // community ID from the URL
  const user = useSelector(selectUser);

  const [community, setCommunity] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch Community Details
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await communityService.getCommunityById(id);
        setCommunity(response.data);
        if (user) {
          setIsMember(
            response.data.members.some((member) => member._id === user._id)
          );
        }
      } catch (error) {
        console.error(
          "Error fetching community:",
          error.response?.data?.message || error.message
        );
        setError(true);
        toast.error(
          error.response?.data?.message || "Failed to fetch community."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCommunity();
  }, [id, user]);

  if (loading) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-500 dark:text-gray-400">
          Loading community...
        </p>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 dark:text-red-400">
          Error loading community.
        </p>
      </div>
    );
  }

  // Render different views based on membership status
  return (
    <ChatSessionProvider communityId={id}>
      {isMember ? (
        <MemberCommunityView
          community={community}
          communityId={id}
          user={user}
          onMembershipChange={() => setIsMember(false)}
        />
      ) : (
        <NonMemberCommunityView
          community={community}
          communityId={id}
          onJoinSuccess={() => setIsMember(true)}
        />
      )}
    </ChatSessionProvider>
  );
}

export default CommunityPage;