const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require("../../vorae-70496-firebase-adminsdk-fbsvc-3da12ba7fe.json");

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucket,
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket(storageBucket);

module.exports = { admin, db, bucket };
