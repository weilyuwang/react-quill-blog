const fs = require("fs");
const mongoose = require("mongoose");

const config = require("./config/key");
// Load models
const { Blog } = require("./models/Blog");

// Connect to DB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Delete data
const deleteData = async () => {
  try {
    // delete all data
    await Blog.deleteMany();

    console.log("Data Deleted");

    // exit the process
    process.exit();
  } catch (err) {
    console.log(err);

    // exit the process
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Wrong Argument!");
  process.exit(1);
}
