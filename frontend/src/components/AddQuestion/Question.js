// /frontend/src/components/AddQuestion/Question.js

import React, { useState } from "react";
import "./Question.css";
import {
  Button,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
  IconButton,
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
import { useNavigate } from "react-router-dom"; // For navigation

function Question() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  // State variables
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

  // Communities data (replace with actual data)
  const communities = [
    { title: "Community1" },
    { title: "Community2" },
    { title: "Community3" },
  ];

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
      formData.append("community", community ? community.title : "");
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

      const response = await axiosInstance.post("/question/create", formData);

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
    <div className="create-post">
      <h1>Ask a public question</h1>

      {/* Community Selection */}
      <div className="select-community">
        <PeopleIcon className="people-icon" />
        <Autocomplete
          options={communities}
          getOptionLabel={(option) => option.title}
          onChange={handleCommunityChange}
          value={community}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select a community"
              variant="outlined"
              fullWidth
            />
          )}
          className="community-select"
          noOptionsText="No communities found"
        />
      </div>

      {/* Title Input */}
      <div className="title-input">
        <TextField
          label="Title*"
          variant="outlined"
          fullWidth
          value={title}
          onChange={handleTitleChange}
          error={titleError}
          helperText={titleError ? "Fill out this field" : ""}
        />
        {titleError && <ErrorIcon className="error-icon" />}
      </div>

      {/* Tags Input */}
      <div className="tags-input">
        <TextField
          label="Tags"
          variant="outlined"
          fullWidth
          value={tags.join(", ")}
          onChange={(e) =>
            setTags(
              e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            )
          }
          helperText="Enter tags separated by commas"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        className="post-tabs"
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{
          ".MuiTab-root": {
            "&:hover": {
              backgroundColor: "#f0f0f0",
              transition: "background-color 0.3s ease",
            },
          },
        }}
      >
        <Tab icon={<NotesIcon />} label="Text" />
        <Tab icon={<ImageIcon />} label="Images & Video" />
        <Tab icon={<PollIcon />} label="Poll" />
      </Tabs>

      {/* Form Submission */}
      <form onSubmit={handleSubmit}>
        {/* Tab Content */}
        <div className="tab-content">
          {tabValue === 0 && (
            <div className="text-tab">
              <MarkdownEditor
                value={body}
                onChange={setBody}
                placeholder="Write your text here (optional)..."
              />
            </div>
          )}
          {tabValue === 1 && (
            <div className="media-upload">
              <CloudUploadIcon className="upload-icon" />
              <h2>Drag and Drop or Upload Media</h2>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                name="files"
                onChange={handleFileChange}
              />
              {/* Optionally, display selected files */}
              {files.length > 0 && (
                <div className="selected-files">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <p>{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tabValue === 2 && (
            <div className="poll-tab">
              <MarkdownEditor
                value={body}
                onChange={setBody}
                placeholder="Add a description for your poll (optional)..."
              />
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="poll-options">
                  {(provided) => (
                    <div
                      className="poll-options"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {pollOptions.map((option, index) => (
                        <Draggable
                          key={option.id}
                          draggableId={option.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className="poll-option"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: snapshot.isDragging
                                  ? "#f0f0f0"
                                  : "#fff",
                                borderRadius: "4px",
                                padding: "8px",
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              {/* Drag Handle */}
                              <div
                                className="drag-handle"
                                {...provided.dragHandleProps}
                                style={{ cursor: "grab", marginRight: "8px" }}
                              >
                                <DragIndicatorIcon />
                              </div>

                              {/* Poll Option Text Field */}
                              <TextField
                                variant="outlined"
                                label={`Option ${index + 1}`}
                                value={option.text}
                                onChange={(event) =>
                                  handlePollOptionChange(index, event)
                                }
                                className="poll-textfield"
                                fullWidth
                              />

                              {/* Remove Option Button */}
                              {pollOptions.length > 2 && (
                                <IconButton
                                  color="secondary"
                                  onClick={() => removePollOption(index)}
                                  className="remove-option-button"
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
              <Button
                variant="outlined"
                color="primary"
                onClick={addPollOption}
                className="add-option-button"
              >
                Add Option
              </Button>
            </div>
          )}
        </div>

        {/* Display submission error if any */}
        {submissionError && (
          <div style={{ color: "red", marginTop: "16px" }}>
            {submissionError}
          </div>
        )}

        {/* Post Button */}
        <Button
          variant="contained"
          color="primary"
          className="post-button"
          type="submit"
        >
          Post
        </Button>
      </form>
    </div>
  );
}

export default Question;
