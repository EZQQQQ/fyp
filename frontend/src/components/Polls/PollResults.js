// frontend/src/components/Polls/PollResults.js

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import {
  voteOnPoll,
  togglePollState,
  fetchPollResults,
} from "../../services/pollService";
import CheckIcon from "@mui/icons-material/Check";

const PollResults = ({ questionId }) => {
  const [pollOptions, setPollOptions] = useState([]);
  const [isClosed, setIsClosed] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionUser, setQuestionUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionIndex, setVotedOptionIndex] = useState(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    const loadPollResults = async () => {
      try {
        const data = await fetchPollResults(questionId);
        const options = data.pollOptions || [];
        const closed = data.isClosed;

        setPollOptions(options);
        setIsClosed(closed);

        let votes = 0;
        options.forEach((option) => {
          votes += option.votes;
        });
        setTotalVotes(votes);

        if (data.user) {
          setQuestionUser(data.user);
        }

        if (
          user &&
          data.userVotedOptionIndex !== null &&
          data.userVotedOptionIndex !== undefined
        ) {
          setHasVoted(true);
          setVotedOptionIndex(data.userVotedOptionIndex);
        } else {
          setHasVoted(false);
        }
      } catch (error) {
        console.error("Error fetching poll results:", error);
      }
    };

    loadPollResults();
  }, [questionId, user]);

  const handleVote = async () => {
    if (selectedOption == null) {
      alert("Please select an option before voting.");
      return;
    }
    try {
      await voteOnPoll(questionId, selectedOption);
      // Reload poll results after voting
      const data = await fetchPollResults(questionId);
      // Update state with new data
      const options = data.pollOptions || [];
      const closed = data.isClosed;

      setPollOptions(options);
      setIsClosed(closed);

      let votes = 0;
      options.forEach((option) => {
        votes += option.votes;
      });
      setTotalVotes(votes);

      if (data.user) setQuestionUser(data.user);
      if (
        user &&
        data.userVotedOptionIndex !== null &&
        data.userVotedOptionIndex !== undefined
      ) {
        setHasVoted(true);
        setVotedOptionIndex(data.userVotedOptionIndex);
      }
    } catch (error) {
      console.error("Error voting on poll:", error);
    }
  };

  const handleTogglePollState = async () => {
    try {
      await togglePollState(questionId);
      // Optimistically toggle the isClosed state
      setIsClosed((prevIsClosed) => !prevIsClosed);
    } catch (error) {
      console.error("Error toggling poll state:", error);
    }
  };

  const renderPoll = () => (
    <div className="relative overflow-hidden mb-4 bg-white dark:bg-gray-800 rounded-lg">
      {/* Overlaying div with pointer-events-none */}
      <div className="absolute inset-0 border border-gray-300 dark:border-gray-700 rounded-lg pointer-events-none"></div>

      <div className="text-sm border-b border-gray-300 dark:border-gray-700 mx-4 py-2 flex justify-between">
        <span className="text-gray-700 dark:text-gray-300">
          {isClosed ? "Closed" : "Open"}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {totalVotes} total votes
        </span>
      </div>

      <div className="p-4">
        {/* Show results if user has voted or poll is closed */}
        {(hasVoted || isClosed) && (
          <>
            {pollOptions.map((option, idx) => {
              const userVotedThisOption = votedOptionIndex === idx;
              const percentage = totalVotes
                ? (option.votes / totalVotes) * 100
                : 0;
              return (
                <div
                  key={option._id}
                  className="flex items-center mb-4 text-gray-900 dark:text-gray-100"
                >
                  {/* Checkmark if user voted this option */}
                  {userVotedThisOption ? (
                    <CheckIcon className="text-green-500 dark:text-green-400 mr-2" />
                  ) : (
                    <div className="w-6 mr-2" />
                  )}
                  {/* Option Text */}
                  <div className="flex-1">{option.option}</div>
                  {/* Progress Bar with Number */}
                  <div className="flex items-center ml-4">
                    {/* Progress Bar */}
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded h-4">
                      <div
                        className="bg-blue-500 dark:bg-blue-600 h-4 rounded"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Fixed-width vote count */}
                    <div className="ml-2 text-sm text-gray-700 dark:text-gray-300 w-12 text-right">
                      {option.votes}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Show voting interface only if poll is open and user has not voted */}
        {!isClosed && !hasVoted && (
          <div className="mt-1">
            {pollOptions.map((option, idx) => (
              <label
                key={option._id}
                className="my-2 flex items-center cursor-pointer text-gray-900 dark:text-gray-100"
              >
                <input
                  type="radio"
                  name="poll"
                  value={idx}
                  onChange={() => setSelectedOption(idx)}
                  className="mr-2"
                />
                {option.option}
              </label>
            ))}
            <button
              onClick={handleVote}
              className="mt-2 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
            >
              Vote
            </button>
          </div>
        )}

        {/* Display 'Toggle Poll' button if user is poll creator */}
        {questionUser && user && questionUser._id === user._id && (
          <div className="mt-4">
            <button
              onClick={handleTogglePollState}
              className="text-sm text-blue-500 dark:text-blue-400 hover:underline"
            >
              {isClosed ? "Open Poll" : "Close Poll"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return <div className="poll-results my-4">{renderPoll()}</div>;
};

export default PollResults;
