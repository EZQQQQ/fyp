// /frontend/src/components/AddQuestion/Question.js

import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Autocomplete,
  IconButton,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorIcon from "@mui/icons-material/Error";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import NotesIcon from "@mui/icons-material/Notes";
import ImageIcon from "@mui/icons-material/Image";
import PollIcon from "@mui/icons-material/Poll";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import axiosInstance from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import CommunityAvatar from "../Community/CommunityAvatar";
import styles from "./styles.css";

function Question() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  // State variables
  const [communities, setCommunities] = useState([]);
  const [community, setCommunity] = useState(null);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [pollOptions, setPollOptions] = useState([
    { id: "option-1", text: "" },
    { id: "option-2", text: "" },
  ]);
  const [files, setFiles] = useState([]); // For file uploads

  // Error handling
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    // Fetch user's communities when component mounts
    const fetchUserCommunities = async () => {
      if (!user) {
        setCommunities([]);
        return;
      }

      try {
        const response = await axiosInstance.get("/communities/user");
        if (response.data.status && Array.isArray(response.data.communities)) {
          setCommunities(response.data.communities);
        } else {
          console.warn("No communities found or incorrect response structure.");
          setCommunities([]);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
        setCommunities([]);
      }
    };

    fetchUserCommunities();
  }, [user]);

  const handleCommunityChange = (event, value) => {
    setCommunity(value);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    if (titleError && event.target.value.trim() !== "") {
      setTitleError(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset specific fields when changing tabs
    setBody("");
    setFiles([]);
    setPollOptions([
      { id: "option-1", text: "" },
      { id: "option-2", text: "" },
    ]);
    setSubmissionError("");
  };

  const handlePollOptionChange = (index, event) => {
    const newOptions = [...pollOptions];
    newOptions[index].text = event.target.value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    const newOption = {
      id: `option-${pollOptions.length + 1}`,
      text: "",
    };
    setPollOptions([...pollOptions, newOption]);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Reset previous errors
    setTitleError(false);
    setSubmissionError("");

    // Validate title
    if (title.trim() === "") {
      setTitleError(true);
      return;
    }

    // Validate community selection
    if (!community) {
      setSubmissionError("Please select a community.");
      return;
    }

    // Adjust contentType mapping
    const contentTypeMapping = {
      0: 0, // Text
      1: 1, // Images & Video
      2: 2, // Poll
    };
    const contentType = contentTypeMapping[tabValue];

    // Additional validations based on contentType
    if (tabValue === 1 && files.length === 0) {
      setSubmissionError("Please upload at least one image or video.");
      return;
    }

    if (tabValue === 2) {
      const filledOptions = pollOptions.filter(
        (option) => option.text.trim() !== ""
      );
      if (filledOptions.length < 2) {
        setSubmissionError("Please provide at least two poll options.");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("community", community ? community._id : "");
      formData.append("title", title.trim());
      formData.append("contentType", contentType);
      formData.append("tags", JSON.stringify(tags));

      if (tabValue === 1) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      if (tabValue === 2) {
        const pollOptionTexts = pollOptions
          .filter((option) => option.text.trim() !== "")
          .map((option) => option.text.trim());
        formData.append("pollOptions", JSON.stringify(pollOptionTexts));
      }

      if (tabValue === 0 || tabValue === 2) {
        formData.append("content", body.trim());
      }

      const response = await axiosInstance.post("/question/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status) {
        alert("Question added successfully");
        navigate(`/question/${response.data.data._id}`);
      } else {
        setSubmissionError(response.data.message || "An error occurred.");
      }
    } catch (err) {
      console.error("Error submitting question:", err);
      setSubmissionError(
        err.response?.data?.message || "Failed to submit the question."
      );
    }
  };

  // Drag and Drop handlers for rearranging poll options
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const reorderedOptions = Array.from(pollOptions);
    const [removed] = reorderedOptions.splice(result.source.index, 1);
    reorderedOptions.splice(result.destination.index, 0, removed);
    setPollOptions(reorderedOptions);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Ask a Public Question
      </h1>

      {/* Community Selection */}
      <div className="flex items-center mb-6 space-x-3">
        <PeopleIcon className="text-gray-600 dark:text-gray-300" />
        <Autocomplete
          options={communities}
          getOptionLabel={(option) => option.name}
          onChange={handleCommunityChange}
          value={community}
          renderOption={(props, option) => (
            <li {...props}>
              <div className="flex items-center space-x-3">
                <CommunityAvatar
                  avatarUrl={option.avatar}
                  name={option.name}
                  className="h-8 w-8"
                />
                <span className="text-gray-800 dark:text-gray-200">
                  {option.name}
                </span>
              </div>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select a Community"
              variant="outlined"
              className="w-full"
              InputLabelProps={{
                className: "text-gray-700 dark:text-gray-300",
              }}
              InputProps={{
                ...params.InputProps,
                sx: { borderRadius: "30px" },
                className:
                  "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600",
              }}
            />
          )}
          className="w-full"
          noOptionsText="No communities found"
          classes={{
            listbox: styles.listbox, // Apply the custom listbox class
          }}
        />
      </div>

      {/* Title Input */}
      <div className="relative mb-6">
        <TextField
          label="Title*"
          variant="outlined"
          fullWidth
          value={title}
          onChange={handleTitleChange}
          error={titleError}
          helperText={titleError ? "Please provide a title." : ""}
          InputProps={{
            sx: { borderRadius: "20px" },
            className:
              "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600",
          }}
          InputLabelProps={{
            className: "text-gray-700 dark:text-gray-300",
          }}
        />
        {titleError && (
          <ErrorIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
        )}
      </div>

      {/* Tags Input */}
      <div className="mb-6">
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={tags}
          onChange={(event, newValue) => {
            setTags(newValue);
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Tags"
              placeholder="Enter tags"
              InputProps={{
                ...params.InputProps,
                sx: { borderRadius: "20px" },
                className:
                  "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600",
              }}
              InputLabelProps={{
                className: "text-gray-700 dark:text-gray-300",
              }}
            />
          )}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        className="mb-6"
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        classes={{
          root: "border-b border-gray-200 dark:border-gray-700",
          indicator: "bg-blue-500",
        }}
      >
        <Tab
          icon={<NotesIcon />}
          label="Text"
          className={`flex flex-col items-center transform transition-all duration-200 ${
            tabValue === 0
              ? "text-blue-500"
              : "text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:scale-105"
          }`}
        />
        <Tab
          icon={<ImageIcon />}
          label="Images & Video"
          className={`flex flex-col items-center transform transition-all duration-200 ${
            tabValue === 1
              ? "text-blue-500"
              : "text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:scale-105"
          }`}
        />
        <Tab
          icon={<PollIcon />}
          label="Poll"
          className={`flex flex-col items-center transform transition-all duration-200 ${
            tabValue === 2
              ? "text-blue-500"
              : "text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:scale-105"
          }`}
        />
      </Tabs>

      {/* Form Submission */}
      <form onSubmit={handleSubmit}>
        {/* Tab Content */}
        <div className="mb-6">
          {tabValue === 0 && (
            <div>
              <MarkdownEditor
                value={body}
                onChange={setBody}
                placeholder="Write your question content here (optional)..."
              />
            </div>
          )}
          {tabValue === 1 && (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200">
              <CloudUploadIcon className="text-gray-500 dark:text-gray-400 text-4xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Drag and Drop or Upload Media
              </h2>
              <input
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                name="files"
                onChange={handleFileChange}
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
              >
                <CloudUploadIcon className="inline-block mr-2" />
                Upload Files
              </label>
              {/* Display selected files */}
              {files.length > 0 && (
                <div className="mt-4 w-full">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Selected Files:
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {tabValue === 2 && (
            <div className="flex flex-col space-y-4">
              <MarkdownEditor
                value={body}
                onChange={setBody}
                placeholder="Add a description for your poll (optional)..."
              />
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="poll-options">
                  {(provided) => (
                    <div
                      className="space-y-4"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {pollOptions.map((option, index) => (
                        <Draggable
                          key={option.id}
                          draggableId={option.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className={`flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-full ${
                                snapshot.isDragging
                                  ? "bg-gray-200 dark:bg-gray-600"
                                  : ""
                              }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab mr-2 text-gray-500 dark:text-gray-300"
                              >
                                <DragIndicatorIcon />
                              </div>
                              {/* Poll Option Input */}
                              <TextField
                                variant="outlined"
                                label={`Option ${index + 1}`}
                                value={option.text}
                                onChange={(event) =>
                                  handlePollOptionChange(index, event)
                                }
                                className="flex-1"
                                InputProps={{
                                  className:
                                    "bg-white dark:bg-gray-700 rounded-full",
                                }}
                                InputLabelProps={{
                                  className: "text-gray-700 dark:text-gray-300",
                                }}
                              />
                              {/* Remove Option Button */}
                              {pollOptions.length > 2 && (
                                <IconButton
                                  onClick={() => removePollOption(index)}
                                  className="text-red-500 dark:text-red-400 ml-2 hover:text-red-600 dark:hover:text-red-300"
                                >
                                  <RemoveCircleIcon />
                                </IconButton>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              {/* Add Option Button */}
              <Button
                variant="outlined"
                color="primary"
                onClick={addPollOption}
                className="self-start hover:bg-blue-50 dark:hover:bg-gray-600 rounded-full"
              >
                Add Option
              </Button>
            </div>
          )}
        </div>

        {/* Display submission error if any */}
        {submissionError && (
          <div className="mb-4 text-red-500 text-sm">{submissionError}</div>
        )}

        {/* Post Button */}
        <div className="flex justify-center">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
          >
            Post
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Question;
