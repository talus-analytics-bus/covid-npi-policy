import React from "react";
import { useParams } from "react-router-dom";

import {
  loadPolicyCategories,
  loadPolicySubCategories,
} from "../PolicyRouter/PolicyLoaders";

import CaseloadPlot from "../CaseloadPlotD3/CaseloadPlot";
import PolicyList from "./PolicyList/PolicyList";

import { MiniMap } from "../MiniMap/MiniMap";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./ListPoliciesPage.module.scss";

const ListPoliciesPage = props => {
  const { iso3, state } = useParams();

  const policyContextConsumer = React.useContext(policyContext);

  // unpacking this so the hook dependency
  // will work correctly
  const { policyObject, setPolicyObject } = policyContextConsumer;

  // Get category and subcategory
  // for all policies when component mountsa
  React.useEffect(() => {
    // don't re-request if policies are already
    // loaded like when the user navigates backwards
    if (Object.keys(policyObject).length < 2) {
      const filters = { iso3: [iso3] };
      if (state !== "national") {
        filters["area1"] = [state];
      }
      loadPolicyCategories({
        filters,
        stateSetter: setPolicyObject,
      });
      loadPolicySubCategories({
        filters,
        stateSetter: setPolicyObject,
      });
    }
  }, [iso3, state, policyObject, setPolicyObject]);

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
        <div className={styles.text}>
          <h1>{state !== "national" ? state : iso3} COVID-19 Policies</h1>
          <div className={styles.quickFacts}>
            <div className={styles.policies}>
              {12345}
              <br /> Policies
            </div>
            <div className={styles.status}>
              New Normal
              <br />
              Policy Status
            </div>
            <div className={styles.status}>
              {12345}
              <br /> 7-Day Cases
            </div>
            <div className={styles.status}>
              {12345}% higher than
              <br /> previous week
            </div>
          </div>
          <p>
            {state ? state : iso3} has been in a {`New Normal`} policy status
            for the past {`two months`}, based on analysis of {12345} measures
            from {12345} {state ? "state and county" : "national"} policies
            covering{" "}
            {Object.keys(policyObject)
              .map(pm => pm.toLowerCase())
              .slice(0, -1)
              .join(", ")}
            , and{" "}
            {Object.keys(policyObject)
              .slice(-1)
              .join("")
              .toLowerCase()}
            .
          </p>
        </div>
        <div className={styles.miniMapHolder}>
          <MiniMap.SVG
            country={iso3}
            state={state}
            counties={miniMapCounties.current}
          />
        </div>
      </section>
      <section className={styles.caseloadPlot}>
        <CaseloadPlot />
      </section>
      <PolicyList />
    </article>
  );
};

export default ListPoliciesPage;
