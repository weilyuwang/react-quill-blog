import React, { useState, useEffect } from "react";
import QuillEditor from "../../../editor/QuillEditor";
import { Typography, Button, Form, message } from "antd";
import axios from "axios";

function EditPage(props) {
  const blogId = props.match.params.blogId;
  const [content, setContent] = useState("");
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    axios.get(`/api/blog/${blogId}`).then((response) => {
      if (response.data.success) {
        console.log(response.data.blog);
        setBlog(response.data.blog);
      } else {
        alert("Couldnt get blog ", blogId);
      }
    });
  }, [blogId]);

  const onContentChange = (text, source) => {
    setContent(text);
  };

  const onUpdate = (event) => {
    event.preventDefault();

    setContent("");

    axios.put(`/api/blog/${blogId}`, { content }).then((response) => {
      if (response) {
        message.success("Blog updated!");

        setTimeout(() => {
          props.history.push(`/blog`);
        }, 500);
      }
    });
  };

  if (!blog) {
    return <h1>Loading blog...</h1>;
  }

  return (
    blog && (
      <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <div style={{ textAlign: "center" }}>
          <Typography.Title level={2}> Editor</Typography.Title>
        </div>
        <QuillEditor onContentChange={onContentChange} content={blog.content} />

        <Form onSubmit={onUpdate}>
          <div style={{ textAlign: "center", margin: "2rem" }}>
            <Button size="large" htmlType="submit" className="">
              Save
            </Button>
          </div>
        </Form>
      </div>
    )
  );
}

export default EditPage;
