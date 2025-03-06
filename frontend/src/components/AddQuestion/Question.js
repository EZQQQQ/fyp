import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Chip,
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

// Custom search-enabled dropdown for selecting a community using a flex layout
const CommunityDropdown = ({ communities, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When a community is selected, update search term
  useEffect(() => {
    if (selected) {
      setSearchTerm(selected.name);
    }
  }, [selected]);

  // Filter communities by search term (case-insensitive)
  const filteredCommunities = communities.filter((comm) =>
    comm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Container styled as an input box using flex */}
      <div className="flex items-center w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl h-15 px-4">
        {selected ? (
          <CommunityAvatar
            avatarUrl={selected.avatar}
            name={selected.name}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8" />
        )}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Select a Community"
          className="flex-1 ml-2 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 text-lg"
        />
      </div>
      {open && filteredCommunities.length > 0 && (
        <ul className="absolute mt-1 w-full max-h-60 overflow-y-auto rounded-md shadow-lg z-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
          {filteredCommunities.map((comm) => (
            <li
              key={comm._id}
              onClick={() => {
                onChange(comm);
                setSearchTerm(comm.name);
                setOpen(false);
              }}
              className="cursor-pointer flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <CommunityAvatar
                avatarUrl={comm.avatar}
                name={comm.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {comm.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
  const [tagInput, setTagInput] = useState(''); // Added tagInput state
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

  // Handle tag input change
  const handleTagInputChange = (event) => {
    setTagInput(event.target.value);
  };

  // Handle tag input keydown (for Enter)
  const handleTagInputKeyDown = (event) => {
    if (event.key === 'Enter' && tagInput.trim() !== '') {
      event.preventDefault(); // Prevent form submission
      const newTag = tagInput.trim();

      // Check if tag already exists
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }

      // Clear input
      setTagInput('');
    }
  };

  // Delete a tag
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          .map((option) => ({ option: option.text.trim() }));
        formData.append("pollOptions", JSON.stringify(pollOptionTexts));
      }

      if (tabValue === 0 || tabValue === 2) {
        formData.append("content", body.trim());
      }

      const response = await axiosInstance.post("/question/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.status) {
        alert("Question added successfully");
        navigate(`/question/${response.data.data._id}`);
      } else {
        setSubmissionError(response.data.message || "An error occurred.");
      }
    } catch (err) {
      console.error("Error submitting question:", err);
      if (err.response && err.response.data) {
        console.error("Backend Response:", err.response.data);
        setSubmissionError(
          err.response.data.message || "Failed to submit the question."
        );
      } else {
        setSubmissionError("Failed to submit the question.");
      }
    }
  };

  // Drag and Drop handlers for rearranging poll options
  const onDragEnd = (result) => {
    if (!result.destination) return;
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
        <div className="flex-1">
          <CommunityDropdown
            communities={communities}
            selected={community}
            onChange={setCommunity}
          />
        </div>
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
          inputProps={{
            className: "text-gray-800 dark:text-gray-200",
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
        <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-[20px] p-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                color="primary"
                size="small"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              />
            ))}
          </div>
          <TextField
            label="Tags"
            variant="outlined"
            placeholder="Type a tag and press Enter"
            fullWidth
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            InputProps={{
              sx: { borderRadius: "20px" },
              className: "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600",
            }}
            inputProps={{
              className: "text-gray-800 dark:text-gray-200",
            }}
            InputLabelProps={{
              className: "text-gray-700 dark:text-gray-300",
            }}
          />
        </div>
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
          className={`flex flex-col items-center transform transition-all duration-200 ${tabValue === 0
            ? "text-blue-500"
            : "text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:scale-105"
            }`}
        />
        <Tab
          icon={<ImageIcon />}
          label="Images & Video"
          className={`flex flex-col items-center transform transition-all duration-200 ${tabValue === 1
            ? "text-blue-500"
            : "text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:scale-105"
            }`}
        />
        <Tab
          icon={<PollIcon />}
          label="Poll"
          className={`flex flex-col items-center transform transition-all duration-200 ${tabValue === 2
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
                placeholder="Write your question content here..."
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
                              className={`flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-full ${snapshot.isDragging
                                ? "bg-gray-200 dark:bg-gray-600"
                                : ""
                                }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab mr-2 text-gray-500 dark:text-gray-300"
                              >
                                <DragIndicatorIcon />
                              </div>
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

        {submissionError && (
          <div className="mb-4 text-red-500 text-sm">{submissionError}</div>
        )}

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