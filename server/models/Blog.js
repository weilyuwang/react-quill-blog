const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = mongoose.Schema(
  {
    content: {
      type: String,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = { Blog };
