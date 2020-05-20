// standard modules
import React, { useState } from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

// 3rd party modules
import ReactTooltip from "react-tooltip";

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
  const [infoTooltipContent, setInfoTooltipContent] = useState(null);
  const toggleLoading = v => setLoading(v);

  return (
    <React.Fragment>
      <BrowserRouter>
        <Nav />
        <Switch>
          <div className={styles.page}>
            {
              // Data page
              <Route exact path="/">
                <Data {...{ setLoading, setInfoTooltipContent }} />
              </Route>
            }
          </div>
        </Switch>
        <Footer />
        {
          // Loading spinner
          <div className={classNames(styles.loading, { [styles.on]: loading })}>
            <img src={loadingSvg} />
          </div>
        }
      </BrowserRouter>
      {
        // Info tooltip that is displayed whenever an info tooltip icon (i)
        // is hovered on in the site. The content for this tooltip is set by
        // `setInfoTooltipContent`.
        <ReactTooltip
          id={"infoTooltip"}
          type="light"
          place="top"
          effect="float"
          delayHide={250}
          clickable={true}
          getContent={() => infoTooltipContent}
        />
      }
    </React.Fragment>
  );
};

export default App;
