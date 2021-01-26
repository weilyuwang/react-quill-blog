import React, { useState, useEffect } from "react";
import QuillEditor from "../../../editor/QuillEditor";
import { Typography, Button, Form, message } from "antd";
import axios from "axios";

function EditPage(props) {
  const postId = props.match.params.postId;
  const [content, setContent] = useState("");
  const [post, setPost] = useState([]);

  useEffect(() => {
    const variable = { postId: postId };

    axios.post("/api/blog/getPost", variable).then((response) => {
      if (response.data.success) {
        console.log(response.data.post);
        setPost(response.data.post);
      } else {
        alert("Couldnt get post");
      }
    });
  }, [postId]);

  const onEditorChange = (value) => {
    setContent(value);
  };

  const onSubmit = (event) => {
    event.preventDefault();

    setContent("");

    const variables = {
      content: content,
    };

    axios.put("/api/blog/updatePost", variables).then((response) => {
      if (response) {
        message.success("Post updated!");

        setTimeout(() => {
          props.history.push(`/blog/${postId}`);
        }, 500);
      }
    });
  };

  console.log("post:", post);

  if (!post.content) {
    return <h1>Loading...</h1>;
  }

  return (
    post.content && (
      <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <div style={{ textAlign: "center" }}>
          <Typography.Title level={2}> Editor</Typography.Title>
        </div>
        <QuillEditor
          onEditorChange={onEditorChange}
          contentValue={post.content}
        />

        <Form onSubmit={onSubmit}>
          <div style={{ textAlign: "center", margin: "2rem" }}>
            <Button size="large" htmlType="submit" className="">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    )
  );
}

export default EditPage;
