import React from "react";
import { useParams } from "react-router-dom";

import {
  loadPolicyCategories,
  loadPolicySubCategories,
} from "../PolicyRouter/PolicyLoaders";

import { MiniMap } from "../MiniMap/MiniMap";
import CaseloadPlot from "../CaseloadPlotD3/CaseloadPlot";

import IntroSection from "./IntroSection/IntroSection.js";
import PolicyList from "./PolicyList/PolicyList";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./ListPoliciesPage.module.scss";

const ListPoliciesPage = props => {
  const { iso3, state } = useParams();

  const policyContextConsumer = React.useContext(policyContext);
  // unpacking this so the hook dependency
  // will work correctly
  const {
    policyObject,
    setPolicyObject,
    status,
    setStatus,
    locationName,
  } = policyContextConsumer;

  // Get category and subcategory
  // for all policies when component mounts
  React.useEffect(() => {
    // don't re-request if policies are already
    // loaded like when the user navigates backwards

    if (status.policies === "initial") {
      const filters = { iso3: [iso3] };
      if (state !== "national") {
        filters["area1"] = [state];
      }

      console.log("request policy list");

      setStatus(prev => ({ ...prev, policies: "loading" }));

      loadPolicyCategories({
        filters,
        stateSetter: setPolicyObject,
        setStatus,
      });
      loadPolicySubCategories({
        filters,
        stateSetter: setPolicyObject,
        setStatus,
      });
    }
  }, [iso3, state, policyObject, setPolicyObject, status, setStatus]);

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
        {status.policies === "loading" && (
          <h3>Loading policies for {locationName}</h3>
        )}
        {status.policies === "error" && (
          <h3>No Policies Found in {locationName}</h3>
        )}

        {status.policies === "loaded" && (
          <>
            <h2>Policies in {locationName}</h2>
            <PolicyList />
          </>
        )}
      </section>
    </article>
  );
};

export default ListPoliciesPage;
