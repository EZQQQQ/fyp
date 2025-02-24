// frontend/src/components/Community/CommunityPage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import communityService from "../../services/communityService";
import questionService from "../../services/questionService";
import quizService from "../../services/quizService";

import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { selectUser } from "../../features/userSlice";
import { setVoteData } from "../../features/voteSlice";
import {
  fetchAssessmentTasks,
  fetchUserParticipation,
} from "../../features/assessmentSlice";

import CreateQuestionButton from "../KnowledgeNode/CreateQuestionButton";
import FilterDropdown from "../KnowledgeNode/FilterDropdown";
import CommunityAvatar from "./CommunityAvatar";
import AssessmentTasks from "./AssessmentTasks";
import AdminAssessmentTasks from "./AdminAssessmentTasks";
import UserAvatar from "../../common/UserAvatar";
import QuestionCard from "../KnowledgeNode/QuestionCard";

// MUI & Material Tailwind Imports
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button } from "@material-tailwind/react";
import { styled } from "@mui/material/styles";

import "react-toastify/dist/ReactToastify.css";

// Chat Imports
import ChatContainer from '../CommunityChat/ChatContainer';
import { ChatSessionProvider } from "../CommunityChat/ChatSessionProvider";

// --- Custom Box Component ---
// This component overrides the default MUI Box styles—for example, removing padding.
const CustomBox = styled(Box)(({ theme }) => ({
  padding: "0 !important",
}));

// --- Custom Tab Panel component for mobile tabs ---
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <CustomBox sx={{ p: 3 }}>{children}</CustomBox>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: () => { },
  index: () => { },
  value: () => { },
};

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

function CommunityPage() {
  const { id } = useParams(); // community ID from the URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const assessment = useSelector((state) => state.assessment);

  const [community, setCommunity] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // For filtering questions (same as in AllQuestions)
  const [filter, setFilter] = useState("newest");
  const filterOptions = [
    { label: "Newest", value: "newest" },
    { label: "Popular", value: "popular" },
  ];
  const selectedFilter = filterOptions.find((opt) => opt.value === filter);
  const handleFilterChange = (option) => {
    setFilter(option.value);
  };

  // Update a specific question's vote data
  const updateQuestionVote = (questionId, voteData) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q._id === questionId
          ? {
            ...q,
            voteCount: voteData.voteCount,
            userHasUpvoted: voteData.userHasUpvoted,
            userHasDownvoted: voteData.userHasDownvoted,
          }
          : q
      )
    );
  };

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

  // Fetch Questions within the Community
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await questionService.getQuestionsByCommunity(id);
        setQuestions(response.data.data || []);
        response.data.data.forEach((question) => {
          dispatch(
            setVoteData({
              targetId: question._id,
              voteInfo: {
                voteCount: question.voteCount,
                userHasUpvoted: question.voteHasUpvoted,
                userHasDownvoted: question.voteHasDownvoted,
              },
            })
          );
        });
      } catch (error) {
        console.error(
          "Error fetching questions:",
          error.response?.data?.message || error.message
        );
        toast.error(
          error.response?.data?.message || "Failed to fetch questions."
        );
      }
    };
    if (community) {
      fetchQuestions();
    }
  }, [community, id, dispatch]);

  // Fetch Quizzes for this Community
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizService.getQuizzesByCommunity(id);
        if (res.success) {
          setQuizzes(res.quizzes);
        } else {
          throw new Error(res.message || "Failed to fetch quizzes.");
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch community quizzes."
        );
      }
    };
    if (community) {
      fetchQuizzes();
    }
  }, [community, id]);

  // Fetch Assessment Tasks and User Participation
  useEffect(() => {
    if (community) {
      dispatch(fetchAssessmentTasks(id));
      if (user && user.role === "student") {
        dispatch(fetchUserParticipation(id));
      }
    }
  }, [community, id, dispatch, user]);

  // Handle Joining and Leaving the Community
  const handleJoin = async () => {
    try {
      await communityService.joinCommunity(id);
      toast.success("Joined community successfully!");
      setIsMember(true);
    } catch (error) {
      console.error(
        "Error joining community:",
        error.response?.data?.message || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to join community."
      );
    }
  };

  const handleLeave = async () => {
    try {
      await communityService.leaveCommunity(id);
      toast.success("Left community successfully!");
      setIsMember(false);
    } catch (error) {
      console.error(
        "Error leaving community:",
        error.response?.data?.message || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to leave community."
      );
    }
  };

  // Navigate to Create Quiz Page
  const handleCreateQuiz = () => {
    navigate(`/communities/${id}/create-quiz`);
  };

  // Navigate to Edit Quiz (for admin)
  const handleDeleteQuiz = async (quizId) => {
    try {
      await quizService.deleteQuiz(quizId);
      toast.success("Quiz deleted successfully.");
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      console.error("Error deleting quiz:", err);
      toast.error("Failed to delete quiz.");
    }
  };

  // Check user role for admin privileges
  const isAdmin = user && (user.role === "professor" || user.role === "admin");

  // Determine if we are on a mobile device (using Material UI breakpoint)
  const mobileBreakpoint = useMediaQuery("(max-width:767px)");

  // For mobile tabs state
  const [mobileTab, setMobileTab] = useState(0);
  const handleMobileTabChange = (event, newValue) => {
    setMobileTab(newValue);
  };

  // Determine if user is a student (for collapsible sections)
  const isStudent = user && user.role === "student";
  // For collapsible sections: for students, default collapsed; for others, always expanded.
  const [assessmentExpanded, setAssessmentExpanded] = useState(
    isStudent ? false : true
  );
  const [membersExpanded, setMembersExpanded] = useState(
    isStudent ? false : true
  );

  // --- Chat State ---
  // Local state to control the visibility of the chat iframe.
  const [chatVisible, setChatVisible] = useState(false);
  const toggleChat = () => setChatVisible((prev) => !prev);

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

  // --- Define the Sidebar content (About) ---
  const sidebarContent = (
    <div className="space-y-4">
      {/* Community Description */}
      <div>
        <h2 className="text-xl font-semibold my-2 text-gray-900 dark:text-gray-100">
          Description
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          {community.description ||
            "No description provided for this community."}
        </p>
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />
      {/* Community Rules */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Community Rules
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
          {community.rules && community.rules.length > 0 ? (
            community.rules.map((rule, index) => <li key={index}>{rule}</li>)
          ) : (
            <li>No specific rules set for this community.</li>
          )}
        </ul>
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />
      {/* Quizzes Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Quizzes
          </h2>
          {isAdmin && (
            <Button
              onClick={handleCreateQuiz}
              size="sm"
              className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700"
            >
              Create Quiz
            </Button>
          )}
        </div>
        {quizzes.length > 0 ? (
          <ul className="text-gray-700 dark:text-gray-300">
            {quizzes.map((quiz, index) => (
              <li key={quiz._id} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <div className="pr-2 break-words">
                    {quiz.title.toLowerCase().includes("quiz")
                      ? quiz.title
                      : `Quiz ${index + 1}: ${quiz.title}`}
                  </div>
                  <div className="flex-shrink-0 space-x-2 mt-1">
                    {isAdmin ? (
                      <>
                        <Button
                          onClick={() => navigate(`/quiz/${quiz._id}/edit`)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </>
                    ) : !quiz.hasAttempted ? (
                      <button
                        onClick={() =>
                          navigate(`/quiz/${quiz._id}/instructions`)
                        }
                        className="border border-gray-300 dark:border-gray-600 text-black dark:text-white text-xs sm:text-sm px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Take
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          navigate(
                            `/quiz/${quiz._id}/attempt/${quiz.attemptId}/results`
                          )
                        }
                        className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 text-xs sm:text-sm px-2 py-1 rounded-md hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white dark:hover:text-white transition-colors duration-200"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No Quizzes currently.
          </p>
        )}
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />
      {/* Assessment Tasks Section */}
      <div className="mb-2">
        <div
          className={`flex items-center justify-between ${isStudent ? "cursor-pointer" : ""
            }`}
          onClick={isStudent ? () => setAssessmentExpanded((prev) => !prev) : undefined}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {isStudent ? "Your Progress" : ""}
          </h2>
          {isStudent && (
            <button className="focus:outline-none">
              {assessmentExpanded ? (
                <ArrowDropUpIcon className="text-gray-900 dark:text-gray-100" />
              ) : (
                <ArrowDropDownIcon className="text-gray-900 dark:text-gray-100" />
              )}
            </button>
          )}
        </div>
        {(isStudent ? assessmentExpanded : true) && (
          <div>
            {isAdmin ? (
              <AdminAssessmentTasks communityId={id} />
            ) : assessment.loading ? (
              <p className="text-gray-500 dark:text-gray-400">
                Loading assessment tasks...
              </p>
            ) : assessment.error ? (
              <p className="text-red-500 dark:text-red-400">{assessment.error}</p>
            ) : (
              <AssessmentTasks tasks={assessment.participation} />
            )}
          </div>
        )}
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />
      {/* Members Section */}
      <div className="mb-4">
        <div
          className={`flex items-center justify-between ${isStudent ? "cursor-pointer" : ""
            }`}
          onClick={isStudent ? () => setMembersExpanded((prev) => !prev) : undefined}
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Members
          </h2>
          {isStudent && (
            <button className="focus:outline-none">
              {membersExpanded ? (
                <ArrowDropUpIcon className="text-gray-900 dark:text-gray-100" />
              ) : (
                <ArrowDropDownIcon className="text-gray-900 dark:text-gray-100" />
              )}
            </button>
          )}
        </div>
        {(isStudent ? membersExpanded : true) && (
          <ul className="space-y-4">
            {community.members && community.members.length > 0 ? (
              community.members.map((member) => (
                <li key={member._id} className="flex items-center">
                  <UserAvatar
                    user={member}
                    handleSignOut={() => { }}
                    className="h-8 w-8 mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {member.username || member.name}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400">
                No members in this community yet.
              </li>
            )}
          </ul>
        )}
      </div>
      <hr className="border-gray-300 dark:border-gray-600" />
      {/* Leave Button */}
      {user && isMember && (
        <button
          onClick={handleLeave}
          className="w-full border border-red-500 text-red-500 px-4 py-2 rounded-full hover:bg-red-100 transition-colors duration-200"
        >
          Leave Community
        </button>
      )}
    </div>
  );

  // --- Mobile Layout using Tabs ---
  if (mobileBreakpoint) {
    return (
      <ChatSessionProvider communityId={id}>
        <div className="max-w-7xl mx-auto p-2 overflow-x-hidden relative">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-0 md:mb-4">
            <div className="flex items-center space-x-4">
              <CommunityAvatar
                avatarUrl={community.avatar}
                name={community.name}
                className="h-10 w-10"
              />
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {community.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <CreateQuestionButton
                communityId={id}
                className="text-xs sm:text-sm px-2 py-1"
              />
              {user && !isMember && (
                <button
                  onClick={handleJoin}
                  className="bg-green-500 text-white text-xs sm:text-sm px-2 py-1 rounded-md hover:bg-green-600 transition-colors duration-200"
                >
                  Join
                </button>
              )}
              <FilterDropdown
                options={filterOptions}
                selected={selectedFilter}
                onSelect={handleFilterChange}
                buttonClassName="text-xs sm:text-sm px-2 py-1"
                optionClassName="text-xs sm:text-sm px-4 py-2"
              />
            </div>
          </div>
          {/* Mobile Tabs */}
          <CustomBox sx={{ width: "100%" }}>
            <CustomBox sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={mobileTab}
                onChange={handleMobileTabChange}
                aria-label="community page tabs"
              >
                <Tab
                  label={<span className="text-gray-900 dark:text-gray-100">Feed</span>}
                  {...a11yProps(0)}
                />
                <Tab
                  label={<span className="text-gray-900 dark:text-gray-100">About</span>}
                  {...a11yProps(1)}
                />
              </Tabs>
            </CustomBox>
            <CustomTabPanel value={mobileTab} index={0}>
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No questions in this community yet.
                  </p>
                ) : (
                  questions.map((question) => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      updateQuestionVote={updateQuestionVote}
                      uploadPath="communityPosts"
                    />
                  ))
                )}
              </div>
            </CustomTabPanel>
            <CustomTabPanel value={mobileTab} index={1}>
              {sidebarContent}
            </CustomTabPanel>
          </CustomBox>
          {/* Chat Button */}
          <ChatContainer communityId={id} />
        </div>
      </ChatSessionProvider>
    );
  }

  // --- Desktop Layout (two-column) ---
  return (
    <ChatSessionProvider>
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 overflow-x-hidden relative">
        {/* Main Content */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <CommunityAvatar
                avatarUrl={community.avatar}
                name={community.name}
                className="h-10 w-10"
              />
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {community.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <CreateQuestionButton
                communityId={id}
                className="text-xs sm:text-sm px-2 py-1"
              />
              {user && !isMember && (
                <button
                  onClick={handleJoin}
                  className="bg-green-500 text-white text-xs sm:text-sm px-2 py-1 rounded-md hover:bg-green-600 transition-colors duration-200"
                >
                  Join
                </button>
              )}
              <FilterDropdown
                options={filterOptions}
                selected={selectedFilter}
                onSelect={handleFilterChange}
                buttonClassName="text-xs sm:text-sm px-2 py-1"
                optionClassName="text-xs sm:text-sm px-4 py-2"
              />
            </div>
          </div>
          <div className="space-y-4">
            {questions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No questions in this community yet.
              </p>
            ) : (
              questions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  updateQuestionVote={updateQuestionVote}
                  uploadPath="communityPosts"
                />
              ))
            )}
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-80 flex-none bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-4">
          {sidebarContent}
        </div>
        {/* Chat Button */}
        <ChatContainer communityId={id} />
      </div>
    </ChatSessionProvider>
  );
}

export default CommunityPage;
