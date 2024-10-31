// /frontend/src/components/Community/CommunityDetail.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import communityService from "../../services/communityService";
import { toast } from "react-toastify";

const CommunityDetail = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await communityService.getCommunityById(id);
        setCommunity(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching community:",
          error.response?.data?.message || error.message
        );
        toast.error(
          error.response?.data?.message || "Failed to fetch community."
        );
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [id]);

  if (loading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Loading community details...
      </p>
    );
  }

  if (!community) {
    return (
      <p className="text-red-500 dark:text-red-400">Community not found.</p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {community.name}
      </h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        {community.description}
      </p>
      <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Members
      </h3>
      <ul className="list-disc list-inside">
        {community.members.map((member) => (
          <li key={member._id} className="text-gray-700 dark:text-gray-300">
            {member.name} ({member.email})
          </li>
        ))}
      </ul>
      {/* Add more details like discussions, resources, etc. */}
    </div>
  );
};

export default CommunityDetail;
