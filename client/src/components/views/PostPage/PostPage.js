import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Button } from "antd";
import { Link } from "react-router-dom";

function PostPage(props) {
  const [post, setPost] = useState([]);
  const postId = props.match.params.postId;

  useEffect(() => {
    const variable = { postId: postId };

    axios.post("/api/blog/getPost", variable).then((response) => {
      if (response.data.success) {
        // console.log(response.data.post);
        setPost(response.data.post);
      } else {
        alert("Couldnt get post");
      }
    });
  }, [postId]);

  return (
    <div className="postPage" style={{ width: "80%", margin: "3rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography.Text>
          Created at
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography.Text>
        <Link to={`/blog/${postId}/edit`}>
          <Button style={{ marginBottom: "10px" }}>Edit Blog</Button>
        </Link>
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

export default PostPage;
