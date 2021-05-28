import React from "react";
import { useParams } from "react-router-dom";

import {
  loadPolicySearch,
  loadPolicyCategories,
  loadPolicySubCategories,
} from "../PolicyRouter/PolicyLoaders";

import { MiniMap } from "../MiniMap/MiniMap";
import CaseloadPlot from "../CaseloadPlotD3/CaseloadPlot";

import SnapshotChartSection from "./SnapshotChart/SnapshotChartSection";
import IntroSection from "./IntroSection/IntroSection.js";
import PolicyFilterBar from "./PolicyFilterBar/PolicyFilterBar";
import PolicyList from "./PolicyList/PolicyList";
import SearchResults from "./SearchResults/SearchResults";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./ListPoliciesPage.module.scss";

const ListPoliciesPage = props => {
  const { iso3, state } = useParams();

  const policyContextConsumer = React.useContext(policyContext);
  const {
    status,
    setStatus,
    policySort,
    locationName,
    policyFilters,
    setPolicyObject,
    setPolicySummaryObject,
    setPolicySearchResults,
  } = policyContextConsumer;

  const searchActive = policyFilters._text && policyFilters._text[0] !== "";

  // Get category and subcategory
  // for all policies when component mounts
  React.useEffect(() => {
    // don't re-request if policies are already
    // loaded like when the user navigates backwards
    if (!searchActive && status.policies && status.policies === "initial") {
      setStatus(prev => ({ ...prev, policies: "loading" }));

      if (!policyFilters.subtarget)
        loadPolicyCategories({
          setStatus,
          filters: policyFilters,
          stateSetter: setPolicyObject,
          sort: policySort,
          ...(status.policiesSummary === "initial" && {
            summarySetter: setPolicySummaryObject,
          }),
        });

      loadPolicySubCategories({
        setStatus,
        filters: policyFilters,
        stateSetter: setPolicyObject,
        sort: policySort,
      });
    }

    if (
      searchActive &&
      status.searchResults &&
      status.searchResults === "initial"
    ) {
      setStatus(prev => ({ ...prev, searchResults: "loading" }));

      loadPolicySearch({
        setStatus,
        setPolicyObject,
        filters: policyFilters,
        stateSetter: setPolicySearchResults,
        sort: policySort,
        pageNumber: 1,
        pageSize: 5,
      });
    }
  }, [
    policyFilters,
    policySort,
    searchActive,
    // unpack status to allow
    // react to do string comparisons
    status.policies,
    status.policiesSummary,
    status.searchResults,
    // these setters won't change
    setPolicyObject,
    setPolicySearchResults,
    setPolicySummaryObject,
    setStatus,
  ]);

  const [scrollPos] = policyContextConsumer.policyListScrollPos;

  React.useLayoutEffect(() => {
    window.scroll(0, scrollPos);
  }, [scrollPos]);

  // if this array is re-created it will make the minimap
  // re-render so we only want to create it when this component mounts
  const miniMapCounties = React.useRef(["Unspecified"]);

  return (
    <article className={styles.listPoliciesPage}>
      <header className={styles.pageHeader}>
        {locationName !== iso3 ? (
          <h1>{locationName} COVID-19 Policies</h1>
        ) : (
          <h1>&nbsp;</h1>
        )}
      </header>
      <section className={styles.chartAndMap}>
        <SnapshotChartSection />
        {iso3 !== "Unspecified" && (
          <div className={styles.miniMapHolder}>
            <MiniMap.SVG
              country={iso3}
              state={state}
              counties={miniMapCounties.current}
            />
          </div>
        )}
      </section>
      <section className={styles.introSection}></section>
      {iso3 !== "Unspecified" && status.caseload !== "error" && (
        <section className={styles.caseloadPlot}>
          {/* {status.caseload === "error" && ( */}
          {/*   <h3>No caseload data found for {locationName}</h3> */}
          {/* )} */}
          {(status.caseload === "loading" || status.caseload === "loaded") && (
            <>
              {status.caseload === "loaded" ? (
                <h2 className={styles.caseloadHeader}>Daily COVID-19 Cases</h2>
              ) : (
                <h2 className={styles.caseloadHeader}>
                  Loading COVID-19 Cases
                </h2>
              )}
              <figure>
                <CaseloadPlot />
                <figcaption>
                  Source:{" "}
                  <a
                    target="_blank"
                    href="https://github.com/nytimes/covid-19-data"
                  >
                    New York Times COVID-19 Data
                  </a>
                </figcaption>
              </figure>
            </>
          )}
        </section>
      )}
      <IntroSection />
      {status.policiesSummary !== "error" && (
        <section className={styles.policyList}>
          {iso3 !== "Unspecified" && <h2>Policies Affecting {locationName}</h2>}
          <PolicyFilterBar />

          {!searchActive && (
            <>
              {status.policies === "loading" && (
                <h3>Loading policies for {locationName}</h3>
              )}
              {status.policies === "error" && (
                <h3>No Policies Found in {locationName}</h3>
              )}
              {status.policies === "loaded" && <PolicyList />}
            </>
          )}
          {searchActive && (
            <>
              {status.searchResults === "loading" && (
                <h3>
                  Searching policies for {policyFilters._text} in {locationName}
                </h3>
              )}
              {status.searchResults === "error" && (
                <h3>
                  No policies matching {policyFilters._text} found in{" "}
                  {locationName}
                </h3>
              )}
              {status.searchResults === "loaded" && <SearchResults />}
            </>
          )}
        </section>
      )}
    </article>
  );
};

export default ListPoliciesPage;
