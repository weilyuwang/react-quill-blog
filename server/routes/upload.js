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

router.post("/signedUrl", (req, res) => {
  const { filename, courseId } = req.body;
  const contentType = mime.lookup(filename);
  const params = {
    Bucket: "quill-editor-blog-demo",
    ContentType: contentType,
    Key: filename, // name of the file we are uploading
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    if (err) {
      console.log(err);
    }
    console.log("The pre-signed URL is:", url);
    res.send({
      fileSource:
        "https://quill-editor-blog-demo.s3.us-east-2.amazonaws.com/" + filename,
      url: url,
    });
  });
});

module.exports = router;
