import React from "react";
import { useParams } from "react-router-dom";

import {
  loadPolicyCategories,
  loadPolicySubCategories,
} from "../PolicyRouter/PolicyLoaders";

import { MiniMap } from "../MiniMap/MiniMap";
import CaseloadPlot from "../CaseloadPlotD3/CaseloadPlot";

import IntroSection from "./IntroSection/IntroSection.js";
import PolicyFilters from "./PolicyFilters/PolicyFilters";
import PolicyList from "./PolicyList/PolicyList";

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
  } = policyContextConsumer;

  const [getSummary, setGetSummary] = React.useState(true);

  // Get category and subcategory
  // for all policies when component mounts
  React.useEffect(() => {
    // don't re-request if policies are already
    // loaded like when the user navigates backwards
    if (status.policies === "initial") {
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
        {status.policies !== "error" && (
          <>
            <h2>Policies in {locationName}</h2>
            <PolicyFilters />
          </>
        )}

        {status.policies === "loading" && (
          <>
            <h3>Loading policies for {locationName}</h3>
            <div style={{ height: "100vh" }} />
          </>
        )}
        {status.policies === "error" && (
          <h3>No Policies Found in {locationName}</h3>
        )}

        {status.policies === "loaded" && <PolicyList />}
      </section>
    </article>
  );
};

export default ListPoliciesPage;
