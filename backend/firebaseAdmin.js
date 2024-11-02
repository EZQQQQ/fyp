// backend/firebaseAdmin.js

const admin = require("firebase-admin");
require("dotenv").config(); // Ensure environment variables are loaded

// Initialize Firebase Admin SDK with environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace escaped newlines with actual newlines in the private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

module.exports = admin;
