// standard modules
import React, { useState } from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

// layout
import { Nav } from "./components/layout";
import { Footer } from "./components/layout";

// views
import Data from "./components/views/data/Data.js";

// styles and assets
import styles from "./App.module.scss";
import classNames from "classnames";
import loadingSvg from "./assets/images/loading.svg";

//: React.FC
const App = () => {
  const [loading, setLoading] = useState(true);
  const toggleLoading = v => setLoading(v);

  return (
    <BrowserRouter>
      <Nav />
      <Switch>
        <div className={styles.page}>
          <Route exact path="/">
            <Data {...{ setLoading }} />
          </Route>
        </div>
      </Switch>
      <Footer />
      <div
        id={"loadingSpinner"}
        className={classNames(styles.loading, { [styles.on]: loading })}
      >
        <img src={loadingSvg} />
      </div>
    </BrowserRouter>
  );
};

export default App;
