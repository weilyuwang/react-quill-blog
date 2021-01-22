import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography } from "antd";
const { Title } = Typography;

function PostPage(props) {
  const [post, setPost] = useState([]);
  const postId = props.match.params.postId;

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

  return (
    <div className="postPage" style={{ width: "80%", margin: "3rem auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Title level={4}>{post.createdAt}</Title>
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

export default PostPage;
