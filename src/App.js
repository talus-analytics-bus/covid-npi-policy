// standard modules
import React, { useState, useEffect } from "react";
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
import About from "./components/views/about/About.js";
// import Documentation from "./components/views/documentation/Documentation.js";

// queries
import { Version } from "./components/misc/Queries";

// styles and assets
import styles from "./App.module.scss";
import classNames from "classnames";
import loadingSvg from "./assets/images/loading.svg";

//: React.FC
const App = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [initDataFilters, setInitDataFilters] = useState(null);
  const [infoTooltipContent, setInfoTooltipContent] = useState(null);
  const [versions, setVersions] = useState(null);
  const toggleLoading = v => setLoading(v);

  // define which browsers should trigger a "please use a different browser"
  // modal, using a function that returns the modal content based on the
  // detected browser
  // TODO fix mobile detection
  const modalToShow = {
    chrome: () => null,
    firefox: () => null,
    safari: browser => browserModal("Safari"),
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
                COVID AMP was designed for Chrome and Firefox desktop browsers,
                but you seem to be using an unsupported browser.
              </p>
              <p>
                If this is correct, please open COVID AMP in Chrome or Firefox
                for desktop instead. Note that most COVID AMP features are not
                optimized for mobile devices.
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

  // render page only after versions data have been loaded
  const getData = async () => {
    const data = await Version();
    return data;
  };
  useEffect(() => {
    getData().then(newVersions => setVersions(newVersions));
  }, []);

  if (versions === null) return <div />;
  else
    return (
      <React.Fragment>
        <BrowserRouter>
          <Nav {...{ page }} />
          <Switch>
            <React.Fragment>
              <div className={classNames(styles.page, styles[page])}>
                {
                  // Data page
                  <Route
                    exact
                    path="/"
                    render={() => {
                      return (
                        <Data
                          {...{
                            setLoading,
                            setPage,
                            setInfoTooltipContent,
                            initDataFilters
                          }}
                        />
                      );
                    }}
                  />
                }
                {
                  // Map page
                  <Route
                    exact
                    path="/map"
                    render={() => {
                      return (
                        <Map
                          {...{
                            versions,
                            setPage,
                            setLoading,
                            setInfoTooltipContent,
                            setInitDataFilters
                          }}
                        />
                      );
                    }}
                  />
                }
                {
                  // About page
                  <Route
                    path="/about/:subpage"
                    render={routeProps => {
                      return (
                        <About
                          {...{
                            setPage,
                            setLoading,
                            initTab: routeProps.match.params.subpage
                          }}
                        />
                      );
                    }}
                  />
                }
                {
                  // // Documentation page
                  // <Route
                  //   exact
                  //   path="/data/documentation"
                  //   render={() => {
                  //     return (
                  //       <Documentation
                  //         {...{
                  //           setPage,
                  //           setLoading
                  //         }}
                  //       />
                  //     );
                  //   }}
                  // />
                }
              </div>
            </React.Fragment>
          </Switch>
          {page !== "map" && <Footer {...{ page, versions }} />}
          {
            // Loading spinner
            <div
              className={classNames(styles.loading, { [styles.on]: loading })}
            >
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
