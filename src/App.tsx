// standard modules
import React, { useState, useEffect } from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import { Helmet } from "react-helmet";

// 3rd party modules
import ReactTooltip from "react-tooltip";
import Modal from "reactjs-popup";
import classNames from "classnames";
import { QueryParamProvider } from "use-query-params";

// layout
import { Nav } from "./components/layout";
import { Footer } from "./components/layout";

// views
import Data from "./components/views/data/Data";
import { DataPageType } from "src/components/views/data/types";
import Map from "./components/views/map/Map";
import About from "./components/views/about/About.js";
import Contact from "./components/views/contact/Contact.js";
import PolicyModel from "./components/views/PolicyModel/PolicyModel/PolicyModel";
import Landing from "./components/views/landing/Landing";

import PolicyRouter from "./components/views/PolicyPage/PolicyRouter/PolicyRouter";

// queries and their types
import { Version, Count, execute } from "src/api/Queries";
import { VersionRecord } from "src/api/queryTypes";
import { CountRecords } from "src/components/misc/dataTypes";

// styles and assets
import styles from "./App.module.scss";

// local components, functions, and types
import Settings from "src/Settings";
import { InfoTooltipProvider } from "src/context/InfoTooltipContext";
import { LoadingSpinner } from "src/components/common";
import { AmpPage } from "src/types";
import { Filters } from "src/components/common/MapboxMap/plugins/mapTypes";
import { BrowserProvider } from "src/components/misc/Util";
import MobileDisclaimer from "src/components/common/MobileDisclaimer/MobileDisclaimer";

//: React.FC
const App = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<AmpPage | null>(null);
  const [infoTooltipContent, setInfoTooltipContent] = useState<string | null>(
    null
  );
  const [versions, setVersions] = useState<VersionRecord[] | null>(null);
  const [counts, setCounts] = useState<CountRecords | null>(null);
  const [routedFrom, setRoutedFrom] = useState("");

  // define which browsers should trigger a "please use a different browser"
  // modal, using a function that returns the modal content based on the
  // detected browser
  // TODO fix mobile detection
  const modalToShow = {
    chrome: () => null,
    firefox: () => null,
    safari: () => browserModal(),
    edge: () => browserModal(),
    ie: () => browserModal(),
    opera: () => browserModal(),
    default: () => null,
  };

  // function to return modal content for unsupported browser modal
  const browserModal = () => (
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
    const queries = {
      version: Version(),
      count: Count({ class_names: ["Policy", "Plan"] }),
    };
    const results = await execute({
      queries,
    });

    setVersions(results.version);
    setCounts(results.count);
  };

  // set versions data from API call
  useEffect(() => {
    getData();
  }, []);

  const pageIsResponsive = page && Settings.RESPONSIVE_PAGES.includes(page);
  if (versions === null || counts === null) return <div />;
  else
    return (
      <InfoTooltipProvider value={{ setInfoTooltipContent }}>
        <Helmet titleTemplate={"%s | COVID AMP"}>
          <title>COVID AMP</title>
          <meta name="COVID AMP" />
        </Helmet>
        <BrowserRouter>
          <QueryParamProvider ReactRouterRoute={Route}>
            <Nav {...{ page }} />
            <Switch>
              <React.Fragment>
                <div
                  data-responsive={pageIsResponsive}
                  className={classNames(
                    styles.page,
                    styles[page !== null ? page : ""]
                  )}
                >
                  {
                    // Data page
                    <Route
                      exact
                      path="/data"
                      render={props => {
                        const newRoutedFrom =
                          (props.location.state ?? ({} as any)).routedFrom ??
                          "";
                        setRoutedFrom(newRoutedFrom);

                        // get URL parameters as strings and JSONs, or null
                        const urlParams = new URLSearchParams(
                          window.location.search
                        );
                        const type: DataPageType =
                          urlParams.get("type") !== null
                            ? (urlParams.get("type") as DataPageType)
                            : "policy";
                        const urlFilterParamsPolicy: Filters | null = getUrlParamAsFilters(
                          urlParams,
                          "filters_policy"
                        );
                        const urlFilterParamsPolicyLegacy: Filters | null = getUrlParamAsFilters(
                          urlParams,
                          "filters"
                        );
                        const urlFilterParamsChallenge: Filters | null = getUrlParamAsFilters(
                          urlParams,
                          "filters_challenge"
                        );
                        const urlFilterParamsPlan: Filters | null = getUrlParamAsFilters(
                          urlParams,
                          "filters_plan"
                        );
                        return (
                          <Data
                            {...{
                              setLoading,
                              loading,
                              setPage,
                              setInfoTooltipContent,
                              urlFilterParamsPolicy:
                                urlFilterParamsPolicyLegacy ||
                                urlFilterParamsPolicy,
                              urlFilterParamsPlan,
                              urlFilterParamsChallenge,
                              counts,
                              type,
                              routedFrom,
                              setRoutedFrom,
                            }}
                          />
                        );
                      }}
                    />
                  }
                  {
                    // Root: Landing Page
                    <Route
                      exact
                      path="/"
                      render={() => {
                        return <Landing {...{ setPage, setLoading }} />;
                      }}
                    />
                  }
                  {
                    // Map page
                    <Route
                      exact
                      path="/policymaps"
                      render={() => {
                        return (
                          <Map
                            {...{
                              versions,
                              setPage,
                              loading,
                              setLoading,
                              setInfoTooltipContent,
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
                              initTab: routeProps.match.params.subpage,
                            }}
                          />
                        );
                      }}
                    />
                  }
                  {
                    // Contact us page
                    <Route
                      exact
                      path="/contact"
                      render={() => {
                        return <Contact {...{ setPage, setLoading }} />;
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
                  {
                    // Model page
                    <Route
                      exact
                      path="/model"
                      render={() => {
                        return <PolicyModel {...{ setPage, setLoading }} />;
                      }}
                    />
                  }
                  {/* { */}
                  {/*   // policy page */}
                  {/*   <Route */}
                  {/*     path="/policy" */}
                  {/*     render={() => { */}
                  {/*       return ( */}
                  {/*         <PolicyPage */}
                  {/*           {...{ */}
                  {/*             setPage, */}
                  {/*             setLoading, */}
                  {/*             policyPageCaseload, */}
                  {/*             setPolicyPageCaseload, */}
                  {/*           }} */}
                  {/*         /> */}
                  {/*       ); */}
                  {/*     }} */}
                  {/*   /> */}
                  {/* } */}
                  {
                    // policy page
                    <Route path="/policies/:iso3/:state">
                      <PolicyRouter {...{ setPage, setLoading }} />
                    </Route>
                  }
                </div>
              </React.Fragment>
            </Switch>
            {!pageIsResponsive && <MobileDisclaimer />}
            {(!pageIsResponsive ||
              (page !== "policymaps" && page !== "landing")) && (
                <Footer {...{ page, versions }} />
              )}
            {
              // // Loading spinner
              // <div
              //   className={classNames(styles.loading, { [styles.on]: loading })}
              // >
              //   <img src={loadingSvg} alt={"Loading spinner"} />
              // </div>
            }
            {<LoadingSpinner isReady={!loading} fullscreen={true} />}
            {<BrowserProvider>{modalToShow}</BrowserProvider>}
          </QueryParamProvider>
        </BrowserRouter>
        {
          // Info tooltip that is displayed whenever an info tooltip icon (i)
          // is hovered on in the site. The content for this tooltip is set by
          // `setInfoTooltipContent`.
          <ReactTooltip
            id={"infoTooltip"}
            type="light"
            effect={Settings.DEFAULT_TOOLTIP_EFFECT}
            place="right"
            delayHide={250}
            clickable={true}
            getContent={() => infoTooltipContent}
          />
        }
      </InfoTooltipProvider>
    );
};

export default App;

/**
 * Returns the value of a URL parameter as JSON.
 * @param urlParams The URL search parameters
 * @param paramKey The name of the param to return as JSON
 * @returns {Object | null} Returns param val as JSON if it exists and is
 * valid JSON, otherwise null
 */
export function getUrlParamAsFilters(
  urlParams: URLSearchParams,
  paramKey: string
): Filters | null {
  // get param value from URL, possibly null
  const v: string | null = urlParams.get(paramKey);

  // if null, return null
  if (v === null) return v;

  // otherwise parse param value as JSON and return it
  try {
    return JSON.parse(v);
  } catch (e) {
    throw Error(`URL param named '${paramKey}' was invalid JSON: ${v}`);
  }
}
