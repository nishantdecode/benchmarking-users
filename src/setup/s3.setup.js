const AWS = require("aws-sdk");
const s3Client = new AWS.S3();
const crypto = require("crypto");

s3Client.config.update({
  apiVersion: "latest",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const uploadParams = {
  Bucket: process.env.S3_BUCKET_NAME,
  Body: null,
  ACL: "public-read",
};
const uploadFile = (file) => {
  console.log("body", file);
  const params = uploadParams;
  const random = crypto.randomBytes(32).toString("hex");
  const fileName = file.originalname;
  const nameArray = fileName.split(".")
  const extention = nameArray[nameArray.length - 1];
  uploadParams.Key = `benchmarking-assets/${nameArray[0]}-${random}.${extention}`;
  uploadParams.Body = file.buffer;
  uploadParams.ContentType = file.mimetype;
  return new Promise((resolve, reject) => {
    return s3Client.upload(params, async (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

module.exports.uploadFile = uploadFile;
