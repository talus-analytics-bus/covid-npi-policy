import React from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import {
  loadPolicySearch,
  loadPolicyCategories,
  loadPolicySubCategories,
  requestSummaryObject,
} from "../PolicyRouter/PolicyLoaders";

import { MiniMap } from "../MiniMap/MiniMap";

import PolicyFilterBar from "./PolicyFilterBar/PolicyFilterBar";
import PolicyList from "./PolicyList/PolicyList";
import SearchResults from "./SearchResults/SearchResults";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./ListPoliciesPage.module.scss";
import IntroSection from "./IntroSection/IntroSection";

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
    setPolicyCategories,
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

      if (status.policiesSummary === "initial")
        requestSummaryObject({
          filters: {
            ...policyFilters,
            level:
              state === "national"
                ? ["Country"]
                : iso3 === "Unspecified"
                ? ["Tribal nation"]
                : ["State / Province"],
          },
          sort: policySort,
          summarySetter: setPolicySummaryObject,
          setStatus,
        });

      if (!policyFilters.subtarget)
        loadPolicyCategories({
          setStatus,
          filters: policyFilters,
          stateSetter: setPolicyObject,
          sort: policySort,
          ...(status.policiesSummary === "initial" && {
            summarySetter: setPolicyCategories,
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
    setPolicyCategories,
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
  // const miniMapCounties = React.useRef(["Unspecified"]);
  const miniMapCounties = React.useRef([]);

  return (
    <article className={styles.listPoliciesPage}>
      <Helmet>
        <title>{locationName}</title>
        <meta name={`COVID-19 policies for ${locationName}`} />
      </Helmet>
      <header className={styles.pageHeader}>
        {locationName !== iso3 ? (
          <h1>{locationName} COVID-19 Policies</h1>
        ) : (
          <h1>&nbsp;</h1>
        )}
        <figure className={styles.miniMapHolder}>
          {iso3 !== "Unspecified" && (
            <MiniMap.SVG
              country={iso3}
              state={state}
              counties={miniMapCounties.current}
            />
          )}
        </figure>
      </header>
      {iso3 !== "Unspecified" && <IntroSection />}
      {status.policiesSummary !== "error" && (
        <section className={styles.policyList}>
          {iso3 !== "Unspecified" && <h2>Explore specific policies</h2>}
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
