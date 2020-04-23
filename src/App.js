// Health Pulse 3 - React implementation of a dashboard for health care
// system impacts data visualization and analysis.

// standard modules
import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import axios from "axios";
import Modal from "reactjs-popup";
import classNames from "classnames";
import * as d3 from "d3/dist/d3.min";
import ReactTooltip from "react-tooltip";
import BrowserDetection from "react-browser-detection";

// layout
import { Nav } from "./components/layout";
import { Footer } from "./components/layout";

// util
import Util from "./components/misc/Util.js";

// views
import Map from "./components/views/map/Map.js";

// styles
import styles from "./App.module.scss";
import infoTooltipStyles from "./components/misc/infotooltip.module.scss";
import "material-design-icons/iconfont/material-icons.css";

// queries
import ObservationQuery from "./components/misc/ObservationQuery.js";
import PlaceQuery from "./components/misc/PlaceQuery.js";
import MetricQuery from "./components/misc/MetricQuery.js";
import TrendQuery from "./components/misc/TrendQuery.js";

//: React.FC
const App = () => {
  // track current page name
  const [page, setPage] = React.useState("");

  // show watermark?
  const [showWm, setShowWm] = React.useState(true);

  // initialize data driving maps and charts
  // init places data (states, etc.)
  const [places, setPlaces] = React.useState(() => {
    const initialState = [];
    return initialState;
  });

  // init metic info data
  const [metricInfo, setMetricInfo] = React.useState(() => {
    const initialState = [];
    return initialState;
  });

  // Track whether the welcome modal has been shown once yet.
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);

  // Track whether the component is still loading.
  const [loading, setLoading] = React.useState(true);

  async function getData() {
    // define queries for app-wide data
    const queries = {
      // Places
      places: PlaceQuery({
        place_id: null, // return all places
        by_region: true // return places by region
      }),
      // Metric info
      metric_info: MetricQuery({})
    };

    // get query results in parallel
    const results = {};
    for (let q in queries) {
      results[q] = await queries[q];
    }

    // set data from results
    setPlaces(results["places"]);
    setMetricInfo(results["metric_info"]);

    // loading completed
    setLoading(false);
  }

  // retrieve app data after initial render
  React.useEffect(() => {
    getData();
  }, []);

  // define which browsers should trigger a "please use a different browser"
  // modal, using a function that returns the modal content based on the
  // detected browser
  const modalToShow = Util.mobilecheck()
    ? { default: () => browserModal("a mobile browser") }
    : {
        chrome: () => null,
        firefox: () => null,
        safari: browser => null,
        edge: browser => browserModal("Edge"),
        ie: browser => browserModal("Internet Explorer"),
        opera: browser => browserModal("Opera"),
        default: browser => browserModal("an unsupported browser")
      };

  // function to return modal content for unsupported browser modal
  const browserModal = browser => (
    <Modal
      position="top center"
      on="click"
      closeOnDocumentClick
      defaultOpen={showWelcomeModal}
      modal
    >
      {close => (
        <div className={styles.modal}>
          <div className={styles.header}>Please try a different browser</div>
          <div className={styles.content}>
            <div className={styles.text}>
              <p>
                Health Pulse was designed for Chrome and Firefox desktop
                browsers, but you seem to be using {browser}.
              </p>
              <p>
                If this is correct, please open Health Pulse in Chrome or
                Firefox for desktop instead.
              </p>
            </div>
            <button className={classNames("button", "modal")} onClick={close}>
              Continue
            </button>
          </div>
        </div>
      )}
    </Modal>
  );

  // define default component
  const defaultComponent = () => {
    if (loading) return <div>Loading...</div>;
    else {
      setPage("map");
      return <Map {...{ metricInfo }} />;
    }
  };

  // JSX for main app.
  return (
    <div
      className={classNames(styles.app, {
        [styles.windowed]: page === "map",
        [styles.watermark]: showWm
      })}
    >
      <BrowserRouter>
        <Nav page={page} places={places} />
        <Switch>
          <div>
            <Route exact path="/" component={defaultComponent} />
          </div>
        </Switch>
        <Footer />
        {<BrowserDetection>{modalToShow}</BrowserDetection>}
      </BrowserRouter>
    </div>
  );
};

export default App;
