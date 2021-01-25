import React, { useState } from "react";
import QuillEditor from "../../../editor/QuillEditor";
import { Typography, Button, Form, message } from "antd";
import axios from "axios";

function CreatePage(props) {
  const [content, setContent] = useState("");

  const onEditorChange = (value) => {
    setContent(value);
  };

  const onSubmit = (event) => {
    event.preventDefault();

    setContent("");

    const variables = {
      content: content,
    };

    axios.post("/api/blog/createPost", variables).then((response) => {
      if (response) {
        message.success("Post Created!");

        setTimeout(() => {
          props.history.push("/blog");
        }, 500);
      }
    });
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div style={{ textAlign: "center" }}>
        <Typography.Title level={2}> Editor</Typography.Title>
      </div>
      <QuillEditor onEditorChange={onEditorChange} />

      <Form onSubmit={onSubmit}>
        <div style={{ textAlign: "center", margin: "2rem" }}>
          <Button size="large" htmlType="submit" className="">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default CreatePage;
