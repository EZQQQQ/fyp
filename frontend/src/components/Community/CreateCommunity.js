// /frontend/src/components/Community/CreateCommunity.js

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createCommunity } from "../../features/communitySlice"; // Use createCommunity thunk
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateCommunity = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Community name is required.");
      return;
    }
    try {
      await dispatch(createCommunity({ name, description })).unwrap();
      setName("");
      setDescription("");
      toast.success("Community created successfully!");
      navigate("/communities"); // Redirect to community list after creation
    } catch (error) {
      // Error handling is already managed in the slice via toast
      console.error("Error creating community:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Create New Community
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Community Name
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter community name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter community description"
            rows="4"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create Community
        </button>
      </form>
    </div>
  );
};

export default CreateCommunity;
