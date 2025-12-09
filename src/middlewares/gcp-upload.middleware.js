const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");

let storage = null;
let bucket = null;
let bucketName = process.env.FIREBASE_STORAGE_BUCKET;

// Try to initialize Google Cloud Storage
try {
  let keyFilePath = null;
  const defaultKeyFile = path.join(__dirname, "../../vorae-70496-firebase-adminsdk-fbsvc-3da12ba7fe.json");
  
  if (fs.existsSync(defaultKeyFile)) {
    keyFilePath = defaultKeyFile;
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  
  if (keyFilePath && bucketName) {
    storage = new Storage({
      keyFilename: keyFilePath,
    });
    bucket = storage.bucket(bucketName);
  } else {
    console.warn("⚠️  GCP Storage credentials not found. File uploads will fail.");
  }
} catch (error) {
  console.warn("⚠️  GCP Storage initialization failed:", error.message);
}

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      reject(new Error("GCP Storage is not configured. Please provide Firebase credentials."));
      return;
    }
    
    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { uploadFile };
