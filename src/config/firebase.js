const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require("../../vorae-70496-firebase-adminsdk-fbsvc-37f2c6fc6b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
