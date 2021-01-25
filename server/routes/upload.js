const express = require("express");
const config = require("../config/key");
const uuid = require("uuid/v1");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});

const router = express.Router();
router.get("/signedUrl", (req, res) => {
  const key = `currentUserId/${uuid()}.jpg`;

  const params = {
    Bucket: "quill-editor-blog-demo",
    ContentType: "jpg",
    Key: key, // name of the file we are uploading
  };

  s3.getSignedUrl("putObject", params, (err, url) => res.send({ key, url }));
});

module.exports = router;
