// standard modules
import React, { useState } from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

// 3rd party modules
import ReactTooltip from "react-tooltip";
import BrowserDetection from "react-browser-detection";
import Modal from "reactjs-popup";

// layout
import { Nav } from "./components/layout";
import { Footer } from "./components/layout";

// views
import Data from "./components/views/data/Data.js";
import Map from "./components/views/map/Map.js";

// styles and assets
import styles from "./App.module.scss";
import classNames from "classnames";
import loadingSvg from "./assets/images/loading.svg";

//: React.FC
const App = () => {
  const [loading, setLoading] = useState(false);
  const [infoTooltipContent, setInfoTooltipContent] = useState(null);
  const toggleLoading = v => setLoading(v);

  // define which browsers should trigger a "please use a different browser"
  // modal, using a function that returns the modal content based on the
  // detected browser
  const modalToShow = {
    chrome: () => null,
    firefox: () => null,
    safari: () => null,
    edge: browser => browserModal("Edge"),
    ie: browser => browserModal("Internet Explorer"),
    opera: browser => browserModal("Opera"),
    default: () => null
  };

  // function to return modal content for unsupported browser modal
  const browserModal = browser => (
    <Modal
      position="top center"
      on="click"
      closeOnDocumentClick
      defaultOpen={true}
      className={"browser-modal"}
      modal
    >
      {close => (
        <React.Fragment>
          <h3 className={styles.header}>Please try a different browser</h3>
          <div className={styles.content}>
            <div className={styles.text}>
              <p>
                COVID AMP was designed for Chrome and Firefox browsers, but you
                seem to be using {browser}.
              </p>
              <p>
                If this is correct, please open COVID AMP in Chrome or Firefox
                instead.
              </p>
            </div>
            <button className={classNames("button", "modal")} onClick={close}>
              Continue
            </button>
          </div>
        </React.Fragment>
      )}
    </Modal>
  );

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
            {
              // Map page
              <Route exact path="/map">
                <Map {...{ setLoading }} />
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
        {<BrowserDetection>{modalToShow}</BrowserDetection>}
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
