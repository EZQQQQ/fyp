// frontend/src/components/Community/MemberCommunityView.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";

import QuestionCard from "../KnowledgeNode/QuestionCard";
import CommunityAvatar from "./CommunityAvatar";
import FilterDropdown from "../KnowledgeNode/FilterDropdown";
import CreateQuestionButton from "../KnowledgeNode/CreateQuestionButton";
import CommunitySidebar from "./CommunitySidebar";
import ChatContainer from "../CommunityChat/ChatContainer";

import questionService from "../../services/questionService";
import quizService from "../../services/quizService";
import communityService from "../../services/communityService";
import { setVoteData } from "../../features/voteSlice";
import {
  fetchAssessmentTasks,
  fetchUserParticipation,
} from "../../features/assessmentSlice";
import { fetchUserCommunities, leaveCommunity } from "../../features/communitySlice";

// --- Custom Box Component ---
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

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

function MemberCommunityView({ community, communityId, user, onMembershipChange }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const assessment = useSelector((state) => state.assessment);

  // State management
  const [questions, setQuestions] = useState([]);
  const [displayOrder, setDisplayOrder] = useState([]); // Add display order state
  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState("newest");
  const [mobileTab, setMobileTab] = useState(0);

  // Filter options
  const filterOptions = [
    { label: "Newest", value: "newest" },
    { label: "Popular", value: "popular" },
  ];
  const selectedFilter = filterOptions.find((opt) => opt.value === filter);

  // Responsive design
  const mobileBreakpoint = useMediaQuery("(max-width:767px)");

  // Update display order based on filter - doesn't depend on questions state changes
  const updateDisplayOrder = (questionsData, currentFilter) => {
    const sortedIds = [...questionsData].sort((a, b) => {
      if (currentFilter === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (currentFilter === "popular") {
        return b.voteCount - a.voteCount;
      }
      return 0;
    }).map(q => q._id);

    setDisplayOrder(sortedIds);
  };

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await questionService.getQuestionsByCommunity(communityId);
        const fetchedQuestions = response.data.data || [];
        setQuestions(fetchedQuestions);

        // Set initial display order based on current filter
        updateDisplayOrder(fetchedQuestions, filter);

        fetchedQuestions.forEach((question) => {
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
        console.error("Error fetching questions:", error);
        toast.error(error.response?.data?.message || "Failed to fetch questions.");
      }
    };

    fetchQuestions();
  }, [communityId, dispatch, filter]);

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizService.getQuizzesByCommunity(communityId);
        if (res.success) {
          setQuizzes(res.quizzes);
        } else {
          throw new Error(res.message || "Failed to fetch quizzes.");
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error(error.response?.data?.message || "Failed to fetch community quizzes.");
      }
    };

    fetchQuizzes();
  }, [communityId]);

  // Fetch assessment tasks
  useEffect(() => {
    dispatch(fetchAssessmentTasks(communityId));
    if (user && user.role === "student") {
      dispatch(fetchUserParticipation(communityId));
    }
  }, [communityId, dispatch, user]);

  // Event handlers
  const handleFilterChange = (option) => {
    setFilter(option.value);
    updateDisplayOrder(questions, option.value);
  };

  const handleMobileTabChange = (event, newValue) => {
    setMobileTab(newValue);
  };

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

  const handleRefreshCode = async () => {
    try {
      const res = await communityService.refreshCommunityCode(communityId);
      toast.success("Community code refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing community code:", error);
      toast.error(error.response?.data?.message || "Failed to refresh community code.");
    }
  };

  const handleCreateQuiz = () => {
    navigate(`/communities/${communityId}/create-quiz`);
  };

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

  const handleLeave = async () => {
    try {
      // Dispatch the leaveCommunity action and wait for it to complete
      await dispatch(leaveCommunity(communityId)).unwrap();

      // Notify parent component about membership change
      onMembershipChange();

      // Navigate back to home page
      navigate('/');
    } catch (error) {
      console.error("Error leaving community:", error);
      toast.error(error.response?.data?.message || "Failed to leave community.");
    }
  };

  // --- Mobile Layout using Tabs ---
  if (mobileBreakpoint) {
    return (
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
            <CreateQuestionButton communityId={communityId} className="text-xs sm:text-sm px-2 py-1" />
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
              <Tab label={<span className="text-gray-900 dark:text-gray-100">Feed</span>} {...a11yProps(0)} />
              <Tab label={<span className="text-gray-900 dark:text-gray-100">About</span>} {...a11yProps(1)} />
            </Tabs>
          </CustomBox>
          <CustomTabPanel value={mobileTab} index={0}>
            <div className="space-y-4">
              {questions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No questions in this community yet.</p>
              ) : (
                displayOrder.map(questionId => {
                  const question = questions.find(q => q._id === questionId);
                  return question ? (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      updateQuestionVote={updateQuestionVote}
                      uploadPath="communityPosts"
                    />
                  ) : null;
                })
              )}
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={mobileTab} index={1}>
            <CommunitySidebar
              community={community}
              communityId={communityId}
              user={user}
              quizzes={quizzes}
              handleRefreshCode={handleRefreshCode}
              handleCreateQuiz={handleCreateQuiz}
              handleDeleteQuiz={handleDeleteQuiz}
              handleLeave={handleLeave}
            />
          </CustomTabPanel>
        </CustomBox>

        {/* Chat Button */}
        <ChatContainer communityId={communityId} />
      </div>
    );
  }

  // --- Desktop Layout (two-column) ---
  return (
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
            <CreateQuestionButton communityId={communityId} className="text-xs sm:text-sm px-2 py-1" />
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
            <p className="text-gray-500 dark:text-gray-400">No questions in this community yet.</p>
          ) : (
            displayOrder.map(questionId => {
              const question = questions.find(q => q._id === questionId);
              return question ? (
                <QuestionCard
                  key={question._id}
                  question={question}
                  updateQuestionVote={updateQuestionVote}
                  uploadPath="communityPosts"
                />
              ) : null;
            })
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 flex-none bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-4">
        <CommunitySidebar
          community={community}
          communityId={communityId}
          user={user}
          quizzes={quizzes}
          handleRefreshCode={handleRefreshCode}
          handleCreateQuiz={handleCreateQuiz}
          handleDeleteQuiz={handleDeleteQuiz}
          handleLeave={handleLeave}
        />
      </div>

      {/* Chat Button */}
      <ChatContainer communityId={communityId} />
    </div>
  );
}

export default MemberCommunityView;