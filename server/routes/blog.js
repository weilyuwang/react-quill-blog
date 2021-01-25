const express = require("express");
const router = express.Router();
const { Blog } = require("../models/Blog");
const multer = require("multer");
const multerS3 = require("multer-s3");
const uuid = require("uuid/v1");
const config = require("../config/key");

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});

// Local disk storage multer config
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const key = `currentUserId/${uuid()}.jpg`;
    console.log("req.file: ", file.originalname);
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".mp4") {
      return cb(res.status(400).end("only jpg, png, mp4 is allowed"), false);
    }
    cb(null, true);
  },
});

const s3BucketStorage = multerS3({
  s3: s3,
  bucket: "quill-editor-blog-demo",
  key: function (req, file, cb) {
    console.log(file);
    cb(null, file.originalname); //use Date.now() for unique file keys
  },
});

const upload = multer({
  storage: s3BucketStorage,
}).single("file");

router.post("/uploadfiles", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    // console.log(res.req.file);
    return res.json({
      success: true,
      url: res.req.file.location, // s3 url
      fileName: res.req.file.originalname, // file name
    });
  });
});

router.post("/createPost", (req, res) => {
  let blog = new Blog({ content: req.body.content });

  blog.save((err, postInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true, postInfo });
  });
});

router.get("/getBlogs", (req, res) => {
  Blog.find().exec((err, blogs) => {
    if (err) return res.status(400).send(err);
    res.status(200).json({ success: true, blogs });
  });
});

router.post("/getPost", (req, res) => {
  console.log(req.body);
  Blog.findOne({ _id: req.body.postId }).exec((err, post) => {
    if (err) return res.status(400).send(err);
    res.status(200).json({ success: true, post });
  });
});

module.exports = router;
