// standard modules
import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

// layout
import { Nav } from "./components/layout";
import { Footer } from "./components/layout";

// views
import Data from "./components/views/data/Data.js";

// // styles
import styles from "./App.module.scss";

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
