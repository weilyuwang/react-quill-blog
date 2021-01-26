import React from "react";
import { Route, Switch } from "react-router-dom";

import LandingPage from "./views/LandingPage/LandingPage.js";
import NavBar from "./views/NavBar/NavBar";

import BlogPage from "./views/BlogPage/BlogPage";
import BlogsPage from "./views/BlogsPage/BlogsPage";
import CreateBlogPage from "./views/BlogPage/Section.js/CreatePage";
import EditPage from "./views/BlogPage/Section.js/EditPage.js";

function App() {
  return (
    <>
      <NavBar />
      <div>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/blog" component={BlogsPage} />
          <Route exact path="/blog/create" component={CreateBlogPage} />
          <Route exact path="/blog/:blogId" component={BlogPage} />
          <Route exact path="/blog/:blogId/edit" component={EditPage} />
        </Switch>
      </div>
    </>
  );
}

export default App;
