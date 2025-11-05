const { Storage } = require("@google-cloud/storage");

const keyFilePath = require("../../vorae-70496-firebase-adminsdk-fbsvc-3da12ba7fe.json");

const storage = new Storage({
  keyFilename: keyFilePath,
});

const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
const bucket = storage.bucket(bucketName);

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
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
