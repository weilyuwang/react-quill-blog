const express = require("express");
const config = require("../config/key");
const AWS = require("aws-sdk");
const mime = require("mime-types");

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  region: "us-east-2",
});

const router = express.Router();

router.get("/signedUrl/:filename", (req, res) => {
  const filename = req.params.filename;
  const contentType = mime.lookup(filename);

  const params = {
    Bucket: "quill-editor-blog-demo",
    ContentType: contentType,
    Key: filename, // name of the file we are uploading
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    console.log("The pre-signed URL is:", url);
    res.send(url);
  });
});

module.exports = router;
