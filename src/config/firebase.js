const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
let serviceAccount = null;
let db = null;
let bucket = null;

// Try to load service account from file or environment variable
try {
  const keyFilePath = path.join(__dirname, "../../vorae-70496-firebase-adminsdk-fbsvc-3da12ba7fe.json");
  
  if (fs.existsSync(keyFilePath)) {
    serviceAccount = require(keyFilePath);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Support JSON string from environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Support path to credentials file
    serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }
  
  if (serviceAccount && storageBucket) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: storageBucket,
      });
    }
    
    db = admin.firestore();
    bucket = admin.storage().bucket(storageBucket);
  } else {
    console.warn("⚠️  Firebase credentials not found. Firebase features will be disabled.");
    console.warn("   To enable Firebase, provide one of:");
    console.warn("   - vorae-70496-firebase-adminsdk-fbsvc-3da12ba7fe.json file in project root");
    console.warn("   - FIREBASE_SERVICE_ACCOUNT environment variable (JSON string)");
    console.warn("   - GOOGLE_APPLICATION_CREDENTIALS environment variable (path to JSON file)");
  }
} catch (error) {
  console.warn("⚠️  Firebase initialization failed:", error.message);
  console.warn("   Firebase features will be disabled.");
}

module.exports = { admin, db, bucket };
