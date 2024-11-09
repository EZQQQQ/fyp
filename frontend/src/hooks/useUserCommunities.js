// frontend/src/hooks/useUserCommunities.js

import { useState, useEffect } from "react";
import communityService from "../services/communityService";

const useUserCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const response = await communityService.getUserCommunities();
        setCommunities(response.data.communities || []);
      } catch (err) {
        console.error("Error fetching user communities:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  return { communities, loading, error };
};

export default useUserCommunities;
