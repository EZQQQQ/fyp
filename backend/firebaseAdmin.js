// /backend/firebaseAdmin.js

const admin = require("firebase-admin");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Path to your service account key JSON file
const serviceAccountPath = path.resolve(
  __dirname,
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  // Optionally, specify databaseURL
  // databaseURL: "https://<your-database-name>.firebaseio.com",
});

module.exports = admin;
