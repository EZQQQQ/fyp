// /frontend/src/components/Community/CommunityPage.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import communityService from "../../services/communityService";
import questionService from "../../services/questionService";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { selectUser } from "../../features/userSlice";
import { setVoteData } from "../../features/voteSlice";
import {
  fetchAssessmentTasks,
  fetchUserParticipation,
} from "../../features/assessmentSlice";
import QuestionCard from "../KnowledgeNode/QuestionCard";
import CreateQuestionButton from "../KnowledgeNode/CreateQuestionButton";
import CommunityAvatar from "./CommunityAvatar";
import AssessmentTasks from "./AssessmentTasks";
import AdminAssessmentTasks from "./AdminAssessmentTasks";
import "react-toastify/dist/ReactToastify.css";

function CommunityPage() {
  const { id } = useParams();
  const user = useSelector(selectUser);
  const dispatch = useDispatch(); // Initialize dispatch

  const [community, setCommunity] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const assessment = useSelector((state) => state.assessment);

  // Function to update a specific question's vote data
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
      toast.error(error.response?.data?.message || "Failed to join community.");
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

  // Determine if the user is an admin or professor
  const isAdmin = user && (user.role === "professor" || user.role === "admin");

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <CommunityAvatar
              avatarUrl={community.avatar}
              name={community.name}
              size="large"
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
                updateQuestionVote={updateQuestionVote} // Pass the callback
              />
            ))
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-6">
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
                  <CommunityAvatar
                    avatarUrl={
                      member.avatar ||
                      "/uploads/defaults/default-avatar-user.jpeg"
                    }
                    name={member.username || member.name}
                    size="small"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
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
