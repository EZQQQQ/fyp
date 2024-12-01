// frontend/src/components/Community/CreateCommunity.js

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCommunity,
  checkCommunityName,
  resetNameCheck,
} from "../../features/communitySlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Avatar } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { PlusIcon, XIcon } from "@heroicons/react/solid";
import CustomDialog from "../Modal/CustomDialog";

const CreateCommunity = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [rules, setRules] = useState([""]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    nameCheck = {},
    loading,
    error,
  } = useSelector((state) => state.communities);

  const { checking, exists, error: nameError } = nameCheck;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setName("");
      setDescription("");
      setAvatar(null);
      setAvatarPreview(null);
      setRules([""]);
      dispatch(resetNameCheck());
    }
  }, [isOpen, dispatch]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      const maxSize = 4 * 1024 * 1024;

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

  const handleRuleChange = (index, value) => {
    const updatedRules = [...rules];
    updatedRules[index] = value;
    setRules(updatedRules);
  };

  const addRule = () => {
    setRules([...rules, ""]);
  };

  const removeRule = (index) => {
    const updatedRules = [...rules];
    updatedRules.splice(index, 1);
    setRules(updatedRules);
  };

  // Updated handleNext function
  const handleNext = async () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        toast.error("Community name is required.");
        return;
      }
      if (!description.trim()) {
        toast.error("Community description is required.");
        return;
      }

      dispatch(resetNameCheck());

      // Dispatch the checkCommunityName thunk
      try {
        const result = await dispatch(checkCommunityName(name.trim())).unwrap();
        const exists = result.exists; // Access the exists property directly

        if (exists) {
          toast.error(
            "Community name already exists. Please choose another name."
          );
          return;
        }
      } catch (err) {
        toast.error(err.message || "Error checking community name.");
        return;
      }
    }

    // Proceed to the next step
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep !== 3) return;

    const filteredRules = rules
      .map((rule) => rule.trim())
      .filter((rule) => rule !== "");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      if (avatar) {
        formData.append("avatar", avatar);
      }
      filteredRules.forEach((rule) => {
        formData.append("rules[]", rule);
      });

      await dispatch(createCommunity(formData)).unwrap();
      onClose();
      navigate("/communities");
    } catch (error) {
      console.error("Error creating community:", error);
      if (error.message === "Community name already exists.") {
        toast.error("Community name already exists.");
      } else {
        toast.error("Error creating community.");
      }
    }
  };

  return (
    <CustomDialog isOpen={isOpen} onClose={onClose} size="md">
      {/* Dialog Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Create a New Community
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${
              currentStep === 1 ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full ${
              currentStep === 2 ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full ${
              currentStep === 3 ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Community Name and Description */}
        {currentStep === 1 && (
          <div className="modal-card-content styled-scrollbar">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Tell us about your Community
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Community Name
              </label>
              <TextField
                type="text"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter community name"
                required
              />
              {/* Display name check status */}
              {checking && (
                <p className="text-sm text-blue-500 mt-1">Checking name...</p>
              )}
              {exists && (
                <p className="text-sm text-red-500 mt-1">
                  Community name already exists.
                </p>
              )}
              {nameError && (
                <p className="text-sm text-red-500 mt-1">
                  Error checking name: {nameError}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <TextField
                type="text"
                fullWidth
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter community description"
                required
                multiline
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Step 2: Avatar */}
        {currentStep === 2 && (
          <div className="modal-card-content styled-scrollbar">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Add Visual Flair
            </h3>
            {/* Avatar Section */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Upload an avatar to represent your community.
              </p>
              <div className="flex items-center space-x-4">
                <Avatar
                  src={avatarPreview}
                  alt="Community Avatar"
                  className="h-20 w-20"
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
                    startIcon={<PhotoCameraIcon />}
                  >
                    Upload Avatar
                  </Button>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Define Rules */}
        {currentStep === 3 && (
          <div className="modal-card-content styled-scrollbar">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Define Rules
            </h3>
            {/* Rules Section */}
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Define the rules that will govern your community.
              </p>
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-center mb-2 border-b border-gray-300 dark:border-gray-600 pb-2"
                >
                  <span className="mr-2 text-gray-700 dark:text-gray-300">
                    {index + 1}.
                  </span>
                  <TextField
                    type="text"
                    variant="outlined"
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    placeholder={`Rule ${index + 1}`}
                    fullWidth
                    required
                  />
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <XIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRule}
                className="mt-2 flex items-center text-blue-500 hover:text-blue-700">
                <PlusIcon className="h-5 w-5 mr-1" /> Add another rule
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          {currentStep > 1 && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handlePrevious}
            >
              Previous
            </Button>
          )}
          {currentStep < 3 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={checking}
            >
              {checking ? "Checking..." : "Next"}
            </Button>
          )}
          {currentStep === 3 && (
            <Button variant="contained" color="primary" type="submit">
              Create Community
            </Button>
          )}
        </div>
      </form>
    </CustomDialog>
  );
};

export default CreateCommunity;