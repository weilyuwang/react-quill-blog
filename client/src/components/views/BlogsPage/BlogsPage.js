import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Icon, Col, Typography, Row } from "antd";
import { Link } from "react-router-dom";

function BlogsPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios.get("/api/blog").then((response) => {
      if (response.data.success) {
        setBlogs(response.data.blogs);
      } else {
        alert("Couldnt get blog`s lists");
      }
    });
  }, []);

  const renderCards = blogs.map((blog, index) => {
    return (
      <Col key={index} lg={8} md={12} xs={24}>
        <Link to={`/blog/${blog._id}`}>
          <Card hoverable style={{ width: 370, marginTop: 16 }}>
            <div style={{ height: 150, overflowY: "scroll", marginTop: 10 }}>
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </Card>
        </Link>
      </Col>
    );
  });

  return (
    <div style={{ width: "85%", margin: "3rem auto" }}>
      <Typography.Title level={2}> Blog Lists </Typography.Title>
      <Row gutter={[48, 24]}>{renderCards}</Row>
    </div>
  );
}

export default BlogsPage;
