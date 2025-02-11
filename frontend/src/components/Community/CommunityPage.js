// /frontend/src/components/Community/CommunityPage.js

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

import { Typography, Button } from "@material-tailwind/react";
import QuestionCard from "../KnowledgeNode/QuestionCard";
import CreateQuestionButton from "../KnowledgeNode/CreateQuestionButton";
import CommunityAvatar from "./CommunityAvatar";
import AssessmentTasks from "./AssessmentTasks";
import AdminAssessmentTasks from "./AdminAssessmentTasks";
import UserAvatar from "../../common/UserAvatar";

import "react-toastify/dist/ReactToastify.css";

function CommunityPage() {
  const { id } = useParams();          // community ID from the URL
  const navigate = useNavigate();      // for programmatic navigation
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [community, setCommunity] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]); // Store community quizzes with hasAttempted
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const assessment = useSelector((state) => state.assessment);

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

        // Check if the user is a member
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

        // Initialize vote data in Redux
        response.data.data.forEach((question) => {
          dispatch(
            setVoteData({
              targetId: question._id,
              voteInfo: {
                voteCount: question.voteCount,
                userHasUpvoted: question.userHasUpvoted,
                userHasDownvoted: question.userHasDownvoted,
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
        // GET /api/quizzes/:communityId/quizzes
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
      dispatch(fetchUserParticipation(id));
    }
  }, [community, id, dispatch]);

  // Handle Joining the Community
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

  // Handle Leaving the Community
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
    // e.g. /communities/:communityId/create-quiz
    // Note: In your quiz creation component, ensure that after creating a quiz,
    // an assessment task is also created (e.g., by calling createAssessmentTask).
    navigate(`/communities/${id}/create-quiz`);
  };

  // Check user role
  const isAdmin = user && (user.role === "professor" || user.role === "admin");

  if (loading) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-500 dark:text-gray-400">Loading community...</p>
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

  // Navigate to Delete Quiz
  const handleDeleteQuiz = async (quizId) => {
    try {
      await quizService.deleteQuiz(quizId);
      toast.success("Quiz deleted successfully.");
      // Remove from local state
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      console.error("Error deleting quiz:", err);
      toast.error("Failed to delete quiz.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
      {/* Main Content */}
      <div className="flex-1 shrink-0 min-w-[36rem]">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <CommunityAvatar
              avatarUrl={community.avatar}
              name={community.name}
              className="h-12 w-12"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {community.name}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Create Question Button */}
            <CreateQuestionButton communityId={id} />

            {/* Join Button */}
            {user && !isMember && (
              <button
                onClick={handleJoin}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
              >
                Join
              </button>
            )}
          </div>
        </div>

        {/* Pinned Post (Placeholder) */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            Pinned Post (To be implemented)
          </p>
        </div>

        {/* List of Questions */}
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
        {/* Community Description */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
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
                className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white"
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
                            size="sm"
                            color="blue"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => navigate(`/quiz/${quiz._id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="red"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleDeleteQuiz(quiz._id)}
                          >
                            Delete
                          </Button>
                        </>
                      ) : !quiz.hasAttempted ? (
                        <Button
                          onClick={() =>
                            navigate(`/quiz/${quiz._id}/instructions`)
                          }
                          size="sm"
                          variant="outlined"
                          className="
                              text-black dark:text-white
                              border-gray-300 dark:border-gray-600
                              hover:bg-gray-300 dark:hover:bg-gray-700
                              hover:text-black dark:hover:text-white
                              transition-colors duration-200
                              rounded-md
                            "
                        >
                          Take
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            navigate(
                              `/quiz/${quiz._id}/attempt/${quiz.attemptId}/results`
                            )
                          }
                          size="sm"
                          variant="outlined"
                          className="
                              text-blue-600 dark:text-blue-400
                              border-blue-600 dark:border-blue-400
                              hover:bg-blue-600 dark:hover:bg-blue-400
                              hover:text-white dark:hover:text-white
                              transition-colors duration-200
                              rounded-md
                            "
                        >
                          View
                        </Button>
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

        {/* Assessment Tasks */}
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

        <hr className="border-gray-300 dark:border-gray-600" />

        {/* Members Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Members
          </h2>
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
    </div>
  );
}

export default CommunityPage;
