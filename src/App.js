// standard modules
import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
// import axios from "axios";
// import classNames from "classnames";
// import ReactTooltip from "react-tooltip";
// import BrowserDetection from "react-browser-detection";
// import Modal from "reactjs-popup";

// layout
import { Nav } from "./components/layout";
import { Footer } from "./components/layout";

// views
import Data from "./components/views/data/Data.js";

// // styles
import styles from "./App.module.scss";
// import "material-design-icons/iconfont/material-icons.css";

const defaultComponent = () => {
  return <Data />;
};

//: React.FC
const App = () => {
  return (
    <BrowserRouter>
      <Nav />
      <Switch>
        <div className={styles.page}>
          <Route exact path="/" component={defaultComponent} />
        </div>
      </Switch>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
