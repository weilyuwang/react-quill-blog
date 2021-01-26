import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Button } from "antd";
import { Link } from "react-router-dom";

function BlogPage(props) {
  const [blog, setBlog] = useState([]);
  const blogId = props.match.params.blogId;

  useEffect(() => {
    axios.get(`/api/blog/${blogId}`).then((response) => {
      if (response.data.success) {
        // console.log(response.data.post);
        setBlog(response.data.blog);
      } else {
        alert("Couldnt get blog with id ", blogId);
      }
    });
  }, [blogId]);

  return (
    <div className="blogPage" style={{ width: "80%", margin: "3rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography.Text>
          Created at
          {new Date(blog.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography.Text>
        <Link to={`/blog/${blogId}/edit`}>
          <Button style={{ marginBottom: "10px" }}>Edit Blog</Button>
        </Link>
      </div>
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
}

export default BlogPage;
