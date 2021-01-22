import React from "react";
import { Route, Switch } from "react-router-dom";

import LandingPage from "./views/LandingPage/LandingPage.js";
import NavBar from "./views/NavBar/NavBar";

import PostPage from "./views/PostPage/PostPage";
import BlogPage from "./views/BlogPage/BlogPage";
import CreateBlogPage from "./views/BlogPage/Section.js/CreatePage";

function App() {
  return (
    <>
      <NavBar />
      <div>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/blog" component={BlogPage} />
          <Route exact path="/blog/create" component={CreateBlogPage} />
          <Route exact path="/blog/post/:postId" component={PostPage} />
        </Switch>
      </div>
    </>
  );
}

export default App;
