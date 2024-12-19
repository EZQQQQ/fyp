// frontend/src/components/ProfileCreation.js

import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createUserProfile } from "../../features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function ProfileCreation() {
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profileBanner, setProfileBanner] = useState(null);
  const [profileBio, setProfileBio] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required.");
      return;
    }

    try {
      await dispatch(
        createUserProfile({ username, profilePicture, profileBanner, profileBio })
      ).unwrap();
      navigate("/"); // Redirect to home page after profile creation
    } catch (err) {
      console.error("Profile Creation Error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
          Create Your Profile
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Username Field */}
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />

          {/* Profile Picture Upload */}
          <div>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="profile-picture-upload"
              type="file"
              onChange={(e) => setProfilePicture(e.target.files[0])}
            />
            <label htmlFor="profile-picture-upload">
              <Button
                variant="contained"
                color="secondary"
                component="span"
                fullWidth
              >
                Upload Profile Picture
              </Button>
            </label>
            {profilePicture && (
              <p className="mt-2 text-center text-gray-700 dark:text-gray-300">
                Selected Picture: {profilePicture.name}
              </p>
            )}
          </div>

          {/* Profile Banner Upload */}
          <div>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="profile-banner-upload"
              type="file"
              onChange={(e) => setProfileBanner(e.target.files[0])}
            />
            <label htmlFor="profile-banner-upload">
              <Button
                variant="contained"
                color="secondary"
                component="span"
                fullWidth
              >
                Upload Profile Banner
              </Button>
            </label>
            {profileBanner && (
              <p className="mt-2 text-center text-gray-700 dark:text-gray-300">
                Selected Banner: {profileBanner.name}
              </p>
            )}
          </div>

          {/* Profile Bio */}
          <div>
            <label className="block text-gray-700 dark:text-gray-100 mb-2" htmlFor="profileBio">
              Profile Bio
            </label>
            <textarea
              id="profileBio"
              rows="4"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2"
              placeholder="Tell us about yourself..."
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
            ></textarea>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ProfileCreation;
