// /frontend/src/components/Community/CreateCommunity.js

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createCommunity } from "../../features/communitySlice"; // Use createCommunity thunk
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Avatar } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const CreateCommunity = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      const maxSize = 4 * 1024 * 1024; // 4MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, JPG, PNG, and GIF files are allowed!");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size exceeds 4MB!");
        return;
      }

      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Community name is required.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      if (avatar) {
        formData.append("avatar", avatar); // Ensure the field name is 'avatar'
      }

      await dispatch(createCommunity(formData)).unwrap();
      setName("");
      setDescription("");
      setAvatar(null);
      setAvatarPreview(null);
      toast.success("Community created successfully!");
      navigate("/communities"); // Redirect to community list after creation
    } catch (error) {
      console.error("Error creating community:", error);
      if (error === "Community name already exists.") {
        toast.error("Community name already exists.");
      } else {
        toast.error("Error creating community.");
      }
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
          <TextField
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
        {/* Avatar Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Community Icon (Optional)
          </label>
          <div className="flex items-center">
            <Avatar
              src={avatarPreview}
              alt="Community Icon"
              className="h-12 w-12 mr-4"
            />
            <label htmlFor="avatar-upload">
              <input
                accept="image/*"
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<PhotoCamera />}
              >
                Upload Icon
              </Button>
            </label>
          </div>
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
