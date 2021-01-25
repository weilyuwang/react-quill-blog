const express = require("express");
const config = require("../config/key");
const uuid = require("uuid/v1");
const AWS = require("aws-sdk");
var path = require("path");

const s3 = new AWS.S3({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});

const router = express.Router();
router.get("/signedUrl/:filename", (req, res) => {
  const filename = req.params.filename;
  const ext = path.extname(filename).split(".").pop();
  const key = `currentUserId/${filename}`;

  const params = {
    Bucket: "quill-editor-blog-demo",
    ContentType: ext,
    Key: key, // name of the file we are uploading
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    console.log(key, url);
    res.send({ key, url });
  });
});

module.exports = router;
