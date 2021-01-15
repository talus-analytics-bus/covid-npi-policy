import React from "react";
import { useParams } from "react-router-dom";

import {
  loadPolicySearch,
  loadPolicyCategories,
  loadPolicySubCategories,
} from "../PolicyRouter/PolicyLoaders";

import { MiniMap } from "../MiniMap/MiniMap";
import CaseloadPlot from "../CaseloadPlotD3/CaseloadPlot";

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
    policyObject,
    setPolicyObject,
    setPolicySummaryObject,
    setPolicySearchResults,
  } = policyContextConsumer;

  const [getSummary, setGetSummary] = React.useState(true);

  const searchActive = policyFilters._text && policyFilters._text[0] !== "";

  // Get category and subcategory
  // for all policies when component mounts
  React.useEffect(() => {
    // don't re-request if policies are already
    // loaded like when the user navigates backwards

    if (!searchActive && status.policies === "initial") {
      setStatus(prev => ({ ...prev, policies: "loading" }));

      loadPolicyCategories({
        setStatus,
        filters: policyFilters,
        stateSetter: setPolicyObject,
        sort: policySort,
        ...(getSummary && { summarySetter: setPolicySummaryObject }),
      });
      loadPolicySubCategories({
        setStatus,
        filters: policyFilters,
        stateSetter: setPolicyObject,
        sort: policySort,
      });

      setGetSummary(false);
    }

    if (searchActive && status.searchResults === "initial") {
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
    iso3,
    state,
    policyObject,
    setPolicyObject,
    status,
    setStatus,
    policyFilters,
    policySort,
    getSummary,
    setPolicySummaryObject,
    searchActive,
    setPolicySearchResults,
  ]);

  const [scrollPos] = policyContextConsumer.policyListScrollPos;

  React.useLayoutEffect(() => {
    window.scroll(0, scrollPos);
  }, [scrollPos]);

  // if this array is re-created it will make the minimap
  // re-render so we only want to create it when this component mounts
  const miniMapCounties = React.useRef(["Unspecified"]);

  return (
    <article>
      <section className={styles.introSection}>
        <IntroSection />
        <div className={styles.miniMapHolder}>
          <MiniMap.SVG
            country={iso3}
            state={state}
            counties={miniMapCounties.current}
          />
        </div>
      </section>
      <section className={styles.caseloadPlot}>
        {status.caseload === "error" && (
          <h3>No caseload data found for {locationName}</h3>
        )}
        {(status.caseload === "loading" || status.caseload === "loaded") && (
          <>
            <h2>Cases in {locationName}</h2>
            <CaseloadPlot />
          </>
        )}
      </section>
      <section className={styles.policyList}>
        <h2>Policies in {locationName}</h2>
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
    </article>
  );
};

export default ListPoliciesPage;
