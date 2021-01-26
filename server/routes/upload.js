const express = require("express");
const config = require("../config/key");
const uuid = require("uuid/v1");
const AWS = require("aws-sdk");
var path = require("path");

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  region: "us-east-2",
});

const router = express.Router();

router.get("/awsbuckets", (req, res) => {
  // Call S3 to list the buckets
  s3.listBuckets(function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      res.send(data.Buckets);
    }
  });
});

router.get("/signedUrl/:filename", (req, res) => {
  const filename = req.params.filename;
  const ext = path.extname(filename).split(".").pop();

  const params = {
    Bucket: "quill-editor-blog-demo",
    ContentType: ext,
    Key: filename, // name of the file we are uploading
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    console.log("The pre-signed URL is:", url);
    res.send({ filename, url });
  });
});

module.exports = router;
