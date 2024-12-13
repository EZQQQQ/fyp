// frontend/src/components/ViewQuestion/MainQuestion.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MarkdownEditor from "../TextEditor/MarkdownEditor";
import axiosInstance from "../../utils/axiosConfig";
import { useSelector, useDispatch } from "react-redux";
import { setVoteData, selectVoteData } from "../../features/voteSlice";
import TextContent from "./TextContent";
import VoteButtons from "../VoteButtons/VoteButtons";
import handleVote from "../../services/votingService";
import useVote from "../../hooks/useVote";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserAvatar from "../../common/UserAvatar";
import MediaViewer from "../MediaViewer/MediaViewer";
import PollResults from "../Polls/PollResults";
import CommentSection from "./CommentSection";

function MainQuestion() {
  const { questionId } = useParams();
  const voteData = useSelector(selectVoteData);
  const dispatch = useDispatch();

  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [answerLoading, setAnswerLoading] = useState({});
  const [answerComments, setAnswerComments] = useState({}); // State to manage comments for each answer
  const [loadingAnswerComments, setLoadingAnswerComments] = useState(false); // Loading state for answer comments

  // Fetch Question Data on Mount
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axiosInstance.get(`/question/${questionId}`);
        setQuestion(response.data.data);
        setComments(response.data.data.comments || []);
        setAnswers(response.data.data.answers || []);
        // Initialize vote data in Redux
        dispatch(
          setVoteData({
            targetId: questionId,
            voteInfo: {
              voteCount: response.data.data.voteCount,
              userHasUpvoted: response.data.data.userHasUpvoted,
              userHasDownvoted: response.data.data.userHasDownvoted,
            },
          })
        );

        // Fetch comments for each answer
        const fetchAllAnswerComments = async () => {
          setLoadingAnswerComments(true);
          try {
            const commentsPromises = response.data.data.answers.map((ans) =>
              axiosInstance.get(`/comment/answer/${ans._id}`)
            );
            const commentsResponses = await Promise.all(commentsPromises);
            const initialAnswerComments = {};
            commentsResponses.forEach((res, index) => {
              initialAnswerComments[response.data.data.answers[index]._id] =
                res.data.data || [];
            });
            setAnswerComments(initialAnswerComments);
          } catch (error) {
            console.error("Error fetching answer comments:", error.response?.data);
            toast.error(
              error.response?.data?.message || "Failed to fetch answer comments."
            );
          } finally {
            setLoadingAnswerComments(false);
          }
        };

        await fetchAllAnswerComments();
      } catch (error) {
        console.error("Error fetching question:", error.response?.data);
        toast.error(
          error.response?.data?.message || "Failed to fetch the question."
        );
      }
    };
    fetchQuestion();
  }, [questionId, dispatch]);

  // Update local question state when vote data changes
  useEffect(() => {
    if (voteData[questionId]) {
      setQuestion((prev) => ({
        ...prev,
        voteCount: voteData[questionId].voteCount,
        userHasUpvoted: voteData[questionId].userHasUpvoted,
        userHasDownvoted: voteData[questionId].userHasDownvoted,
      }));
    }
  }, [voteData, questionId]);

  // Sync answer vote data from Redux to local state
  useEffect(() => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((ans) => {
        if (voteData[ans._id]) {
          const voteInfo = voteData[ans._id];
          return {
            ...ans,
            voteCount: voteInfo.voteCount,
            userHasUpvoted: voteInfo.userHasUpvoted,
            userHasDownvoted: voteInfo.userHasDownvoted,
          };
        }
        return ans;
      })
    );
  }, [voteData]);

  // Handle voting for the main question using useVote hook
  const {
    handleUpvote: handleQuestionUpvote,
    handleDownvote: handleQuestionDownvote,
    loading: questionLoading,
  } = useVote(questionId, true, (voteData) => {
    setQuestion((prev) => ({
      ...prev,
      voteCount: voteData.voteCount,
      userHasUpvoted: voteData.userHasUpvoted,
      userHasDownvoted: voteData.userHasDownvoted,
    }));
  });

  // Handle voting for answers using existing functions with loading state
  const handleAnswerVote = async (type, answerId) => {
    if (answerLoading[answerId]) return;

    setAnswerLoading((prev) => ({ ...prev, [answerId]: true }));

    try {
      const voteResult = await handleVote(type, answerId, false);
      setAnswers((prevAnswers) =>
        prevAnswers.map((ans) =>
          ans._id === answerId
            ? {
              ...ans,
              voteCount: voteResult.voteCount,
              userHasUpvoted: voteResult.userHasUpvoted,
              userHasDownvoted: voteResult.userHasDownvoted,
            }
            : ans
        )
      );
      dispatch(
        setVoteData({
          targetId: answerId,
          voteInfo: {
            voteCount: voteResult.voteCount,
            userHasUpvoted: voteResult.userHasUpvoted,
            userHasDownvoted: voteResult.userHasDownvoted,
          },
        })
      );
      if (voteResult.action === "voted") {
        toast.success(
          type === "upvote"
            ? "Answer upvoted successfully!"
            : "Answer downvoted successfully!"
        );
      } else if (voteResult.action === "removed") {
        toast.info(
          type === "upvote"
            ? "Upvote removed from answer."
            : "Downvote removed from answer."
        );
      }
    } catch (error) {
      console.error("Voting Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to vote.");
    } finally {
      setAnswerLoading((prev) => ({ ...prev, [answerId]: false }));
    }
  };

  const handleAddQuestionComment = async (parentId, comment) => {
    try {
      const response = await axiosInstance.post(`/comment/question/${parentId}`, {
        comment,
      });
      setComments([...comments, response.data.data]);
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleAddAnswerComment = async (answerId, comment) => {
    try {
      const response = await axiosInstance.post(`/comment/answer/${answerId}`, {
        comment,
      });
      setAnswerComments((prev) => ({
        ...prev,
        [answerId]: [...prev[answerId], response.data.data],
      }));
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (answerText.trim() === "") return;
    try {
      const response = await axiosInstance.post(`/answer/${questionId}`, {
        answer: answerText,
      });
      const newAnswer = response.data.data;

      const answerWithDefaults = {
        ...newAnswer,
        userHasUpvoted: false,
        userHasDownvoted: false,
        comments: [], // Initialize comments array for the new answer
      };

      setAnswers((prevAnswers) => [...prevAnswers, answerWithDefaults]);

      setAnswerComments((prev) => ({
        ...prev,
        [newAnswer._id]: [],
      }));

      setAnswerText("");
      toast.success("Answer posted successfully!");
    } catch (error) {
      console.error("Error adding answer:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to post answer.");
    }
  };

  if (!question) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-4 sm:mb-0 text-gray-900 dark:text-gray-100 break-words">
            {question.title}
          </h2>
        </div>

        {/* Question Info */}
        <div className="mb-6">
          <div className="flex flex-wrap text-sm text-gray-500 dark:text-gray-400">
            <p className="mr-4">
              Asked:{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {new Date(question.createdAt).toLocaleString()}
              </span>
            </p>
            <p className="mr-4">
              Active:{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {new Date(question.updatedAt).toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Question Section */}
        <div className="mb-8">
          {/* Content */}
          <div className="mb-4">
            <TextContent content={question.content} type="question" />
          </div>

          {/* Files */}
          {question.files?.length > 0 && (
            <div className="my-4">
              {question.files.map((fileUrl, index) => (
                <MediaViewer key={index} file={fileUrl} />
              ))}
            </div>
          )}

          {/* Poll Results */}
          {question.contentType === 2 && <PollResults questionId={questionId} />}

          {/* Author Info and Voting Buttons */}
          <div className="flex items-center justify-between mt-6">
            {/* Voting Buttons */}
            <VoteButtons
              voteCount={question.voteCount}
              onUpvote={handleQuestionUpvote}
              onDownvote={handleQuestionDownvote}
              userHasUpvoted={question.userHasUpvoted}
              userHasDownvoted={question.userHasDownvoted}
              loading={questionLoading}
            />

            {/* Author Info */}
            <div className="flex items-center space-x-2">
              <UserAvatar
                user={question.user}
                handleSignOut={() => { }}
                className=""
              />
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {question.user?.username || question.user?.name || "Anonymous"}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(question.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Comments */}
          <CommentSection
            comments={comments}
            onAddComment={handleAddQuestionComment}
            loading={false}
            parentId={questionId}
            commentType="question"
          />
        </div>

        {/* Separator between Question and Answers */}
        <hr className="border-t border-gray-300 dark:border-gray-700 mb-8" />

        {/* Answer Form */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Your Answer
          </h3>
          <div className="mb-4">
            <MarkdownEditor
              value={answerText}
              onChange={setAnswerText}
              placeholder="Write your answer here..."
            />
          </div>
          <button
            onClick={handleAnswerSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Post Your Answer
          </button>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          </h3>
          {answers.map((answer, index) => (
            <div key={answer._id}>
              <div
                className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm flex flex-col"
              >
                {/* Content */}
                <div className="mb-4">
                  <TextContent content={answer.answer} type="answer" />
                </div>

                {/* Files (Optional) */}
                {answer.files?.length > 0 && (
                  <div className="my-4">
                    {answer.files.map((fileUrl, idx) => (
                      <MediaViewer key={idx} file={fileUrl} />
                    ))}
                  </div>
                )}

                {/* Author Info and Voting Buttons */}
                <div className="flex items-center justify-between mt-6">
                  {/* Voting Buttons */}
                  <VoteButtons
                    voteCount={answer.voteCount}
                    onUpvote={() => handleAnswerVote("upvote", answer._id)}
                    onDownvote={() => handleAnswerVote("downvote", answer._id)}
                    userHasUpvoted={answer.userHasUpvoted}
                    userHasDownvoted={answer.userHasDownvoted}
                    loading={answerLoading[answer._id] || false}
                  />

                  {/* Author Info */}
                  <div className="flex items-center space-x-2">
                    <UserAvatar
                      user={answer.user}
                      handleSignOut={() => { }}
                      className=""
                    />
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {answer.user?.username || answer.user?.name || "Anonymous"}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(answer.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Comments for Answer */}
                <CommentSection
                  comments={answerComments[answer._id] || []}
                  onAddComment={handleAddAnswerComment}
                  loading={loadingAnswerComments}
                  parentId={answer._id}
                  commentType="answer"
                />
              </div>
              {/* Separator between answers */}
              {index !== answers.length - 1 && (
                <hr className="border-t border-gray-300 dark:border-gray-700 mb-6" />
              )}
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}

export default MainQuestion;