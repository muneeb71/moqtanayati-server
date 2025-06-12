import { Storage } from "@google-cloud/storage";

const keyFilePath = "ServiceAccount.json";

const storage = new Storage({
  keyFilename: keyFilePath,
});

const bucketName = "dome-bucket";
const bucket = storage.bucket(bucketName);

export const uploadFile = (file) => {
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
