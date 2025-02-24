// /backend/controllers/quizController.js

const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Community = require("../models/Community");
const pdfParse = require('pdf-parse');
const openai = require("../utils/openaiClient");

/**
 * CREATE a new quiz for a specific community
 */
async function createQuizForCommunity(req, res) {
  try {
    const { communityId } = req.params;
    const { title, instructions, questions } = req.body;
    const createdBy = req.user._id;

    // Validate input
    if (!title || !instructions || !questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400);
      throw new Error("Invalid input: Title and questions are required.");
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    const quiz = new Quiz({
      community: community._id,
      title,
      instructions,
      createdBy,
      questions,
    });

    await quiz.save();
    return res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error("Error creating quiz for community:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * CREATE a new quiz using OpenAI API and an uploaded document.
 * Processes the file from memory (using pdfParse) and uses GPT-4o.
 * This endpoint does not save the quiz—it returns the generated quiz data for editing.
 */
async function createQuizWithAI(req, res) {
  try {
    const { communityId } = req.params;
    const { learningObjective, numQuestions, numOptions, allowMultiple } = req.body;
    const createdBy = req.user._id;

    if (!learningObjective || !numQuestions || !numOptions) {
      return res.status(400).json({ success: false, message: "Missing prompt inputs." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No document uploaded." });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    // Process file from memory using pdfParse
    const data = await pdfParse(req.file.buffer);
    const documentText = data.text;

    const systemPrompt = `
You are an AI assistant that creates quizzes based on educational documents.
Follow the provided learning objective, number of questions, number of options, and document content.
Generate a quiz in JSON format with the following structure:
{
  "title": "Quiz Title",
  "instructions": "Quiz instructions with placeholders if needed",
  "questions": [
    {
      "questionText": "Question text",
      "allowMultipleCorrect": false,
      "options": [
        {"optionText": "Option text", "isCorrect": true},
        {"optionText": "Option text", "isCorrect": false}
      ],
      "explanation": "Explanation for the question"
    },
    ...
  ]
}
Only output the JSON without any additional commentary.
    `;

    const prompt = `
Learning Objective: ${learningObjective}
Number of Questions: ${numQuestions}
Number of Options per Question: ${numOptions}
Allow Multiple Correct Answers: ${allowMultiple}

Document Content:
${documentText}
    `;

    // Use GPT-4o to generate the quiz using the chat completions endpoint
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    // Remove markdown code fences if present
    let responseText = completion.choices[0].message.content.trim();
    responseText = responseText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();

    let quizData;
    try {
      quizData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return res.status(500).json({ success: false, message: "Failed to parse AI response." });
    }

    // Set default instructions (do not override with AI-generated instructions)
    const defaultInstructions = `After you have completed the online lesson, complete this assessment quiz that tests your knowledge of the content covered in the online lesson.

Note:
1) You will not be able to attempt the quiz after the due date and will not get any scores for this quiz.
2) You are required to complete the entire quiz in a single session once you have started it. Please do not attempt the quiz from more than one browser window/tab or device as the second access would be considered a re-attempt.

INSTRUCTIONS
Description:
This MCQ is based on the lecture content.
Instructions:
Complete all {number} questions.
Force Completion: Once started, this test must be completed in one sitting. Do not leave the test before clicking Save and Submit.
Due Date: This Test is due on {time set by professor}. Test submitted past this date will not be recorded.`;

    // Instead of saving the quiz, return the quiz data for further editing.
    // override the instructions with our default instructions.
    const quiz = {
      community: community._id,
      title: quizData.title || "Untitled Quiz",
      instructions: defaultInstructions,
      createdBy,
      questions: quizData.questions || [],
    };

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error("Error creating quiz with AI:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * READ: Get all quizzes in a given community with attempt status
 */
async function getQuizzesByCommunity(req, res) {
  try {
    const { communityId } = req.params;
    const userId = req.user._id; // Ensure authentication middleware populates req.user

    const quizzes = await Quiz.find({ community: communityId })
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    // Fetch all attempts by the user for quizzes in this community
    const attempts = await QuizAttempt.find({
      quiz: { $in: quizzes.map((q) => q._id) },
      user: userId,
    }).sort({ createdAt: -1 });

    // Create a map from quizId to attemptId (latest only)
    const attemptMap = {};
    attempts.forEach((attempt) => {
      const quizId = attempt.quiz.toString();
      // If multiple attempts exist, retain only the latest attemptId
      if (!attemptMap[quizId]) {
        attemptMap[quizId] = attempt._id.toString();
      }
    });

    // Map quizzes to include hasAttempted and attemptId
    const quizzesWithAttemptStatus = quizzes.map((quiz) => ({
      ...quiz.toObject(),
      hasAttempted: !!attemptMap[quiz._id.toString()],
      attemptId: attemptMap[quiz._id.toString()] || null,
    }));

    return res.json({ success: true, quizzes: quizzesWithAttemptStatus });
  } catch (error) {
    console.error("Error fetching quizzes by community:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * READ: Get a single quiz by quizId
 */
async function getQuizById(req, res) {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    return res.json({ success: true, quiz });
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * UPDATE a quiz by quizId
 */
async function updateQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const { title, questions } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    if (title !== undefined) quiz.title = title;
    if (questions !== undefined) quiz.questions = questions;

    await quiz.save();
    return res.json({ success: true, quiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * DELETE a quiz by quizId
 */
async function deleteQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }
    return res.json({ success: true, message: "Quiz deleted successfully." });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * START a quiz attempt session
 */
async function startQuizAttempt(req, res) {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    const totalPossibleScore = quiz.questions.length;

    // Initialize answers array with default values
    const initAnswers = quiz.questions.map((q) => ({
      questionId: q._id,
      selectedOptionId: [],
      isCorrect: false, // default, will be updated upon submission
    }));

    // Create a new QuizAttempt
    const quizAttempt = await QuizAttempt.create({
      user: userId,
      quiz: quizId,
      community: quiz.community,
      totalPossibleScore,
      answers: initAnswers,
    });

    return res.status(201).json({
      success: true,
      attemptId: quizAttempt._id,
    });
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * END a quiz attempt session
 */
async function endQuizAttempt(req, res) {
  try {
    const { quizId, attemptId } = req.params;
    const userId = req.user._id;

    const quizAttempt = await QuizAttempt.findOne({
      _id: attemptId,
      quiz: quizId,
      user: userId,
    });

    if (!quizAttempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found." });
    }

    quizAttempt.endedAt = Date.now();
    await quizAttempt.save();

    return res.status(200).json({
      success: true,
      message: "Quiz attempt ended successfully.",
    });
  } catch (error) {
    console.error("Error ending quiz attempt:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * SUBMIT quiz answers
 */
async function submitQuizAttempt(req, res) {
  try {
    const { quizId, attemptId } = req.params;
    const userId = req.user._id;
    const { answers } = req.body;

    const quizAttempt = await QuizAttempt.findOne({
      _id: attemptId,
      quiz: quizId,
      user: userId,
    }).populate("quiz");

    if (!quizAttempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found." });
    }

    if (quizAttempt.submittedAt) {
      return res.status(400).json({ success: false, message: "Quiz attempt has already been submitted." });
    }

    const quiz = quizAttempt.quiz;
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    let score = 0;

    // Evaluate each question
    const evaluatedAnswers = quiz.questions.map((question) => {
      // Find the user's answer for this question
      const userAnswer = answers.find(
        (a) => a.questionId.toString() === question._id.toString()
      );

      // If the user did not provide an answer, default to an empty array
      let userOptionIds = [];
      if (userAnswer && userAnswer.selectedOptionId) {
        if (Array.isArray(userAnswer.selectedOptionId)) {
          userOptionIds = userAnswer.selectedOptionId.map((id) => id.toString());
        } else {
          userOptionIds = [userAnswer.selectedOptionId.toString()];
        }
      }

      // Get correct option IDs for the question
      const correctOptionIds = question.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt._id.toString());

      // Determine correctness: if the question was answered (i.e. userOptionIds is not empty)
      // and the user options exactly match the correct options, mark as correct.
      const isCorrect =
        userOptionIds.length > 0 &&
        correctOptionIds.length === userOptionIds.length &&
        correctOptionIds.every((id) => userOptionIds.includes(id));

      if (isCorrect) score += 1;

      return {
        questionId: question._id,
        selectedOptionId: userOptionIds,
        isCorrect,
      };
    });

    quizAttempt.answers = evaluatedAnswers;
    quizAttempt.score = score;
    quizAttempt.submittedAt = Date.now();
    quizAttempt.endedAt = Date.now();

    await quizAttempt.save();

    return res.status(200).json({
      success: true,
      quizAttempt,
      message: `Quiz submitted! You scored ${score} out of ${quiz.totalPossibleScore}.`,
    });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * GET quiz attempt details
 */
async function getQuizAttempt(req, res) {
  try {
    const { quizId, attemptId } = req.params;
    const userId = req.user._id;

    const quizAttempt = await QuizAttempt.findOne({
      _id: attemptId,
      quiz: quizId,
      user: userId,
    })
      .populate({
        path: "quiz",
        populate: {
          path: "questions.options",
          model: "Option",
        },
      })
      .populate("community", "name");

    if (!quizAttempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found." });
    }

    return res.status(200).json({
      success: true,
      quizAttempt,
    });
  } catch (error) {
    console.error("Error getting quiz attempt:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

module.exports = {
  createQuizForCommunity,
  createQuizWithAI,
  getQuizzesByCommunity,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  endQuizAttempt,
  submitQuizAttempt,
  getQuizAttempt,
};