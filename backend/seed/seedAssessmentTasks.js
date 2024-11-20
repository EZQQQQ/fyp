// /backend/seed/seedAssessmentTasks.js

const mongoose = require("mongoose");
const Community = require("../models/Community");
require("dotenv").config();

const seedAssessmentTasks = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const communities = await Community.find();

  for (const community of communities) {
    if (community.assessmentTasks.length === 0) {
      community.assessmentTasks = [
        {
          label: "Votes on Questions & Answers",
          type: "votes",
          contentType: "questions",
          total: 50,
          weight: 20,
        },
        {
          label: "Question Postings",
          type: "postings",
          contentType: "questions",
          total: 10,
          weight: 20,
        },
        {
          label: "Answer Postings",
          type: "postings",
          contentType: "answers",
          total: 10,
          weight: 20,
        },
        {
          label: "Uploaded Resources",
          type: "resources",
          total: 3,
          weight: 10,
        },
        {
          label: "Weekly Contributions",
          type: "discussions",
          total: 1, // At least 1 per week
          weight: 10,
        },
        {
          label: "Quiz Score",
          type: "quizzes",
          total: 100, // Assuming 100% is needed
          weight: 20,
        },
      ];

      await community.save();
      console.log(`Seeded assessment tasks for community: ${community.name}`);
    }
  }

  mongoose.connection.close();
};

seedAssessmentTasks();
