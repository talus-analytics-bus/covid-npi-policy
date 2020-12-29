import React from "react";
import { useParams } from "react-router-dom";

import {
  loadPolicyCategories,
  loadPolicySubCategories,
  loadPolicyDescriptions,
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../PolicyRouter/PolicyLoaders";

import ExpandingSection from "./ExpandingSection/ExpandingSection";
import ExpandMarker from "./ExpandMarker/ExpandMarker";
import PolicySummary from "../PolicySummary/PolicySummary";
import PolicyCategoryIcon from "../PolicyCategoryIcon/PolicyCategoryIcon";
import CaseloadPlot from "../CaseloadPlotD3/CaseloadPlot";

import { MiniMap } from "../MiniMap/MiniMap";

import styles from "./ListPoliciesPage.module.scss";

const articles = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/;

let capitalizeLetter = (word, index) => {
  if (/[a-z, A-Z]/.test(word.charAt(index))) {
    return (
      word.slice(0, index) +
      word.charAt(index).toUpperCase() +
      word.slice(index + 1, word.length)
    );
  }
  return capitalizeLetter(word, index + 1);
};

let titleCase = string =>
  string
    .split(" ")
    .map(word => (articles.test(word) ? word : capitalizeLetter(word, 0)))
    .join(" ");

const ListPoliciesPage = props => {
  const { iso3, state } = useParams();

  // unpacking this so the hook dependency
  // will work correctly
  const { policyObject, setPolicyObject } = props;

  // Get category and subcategory
  // for all policies when component mounts
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

  const [openSections, setOpenSections] = props.openSections;
  const [scrollPos, setScrollPos] = props.policyListScrollPos;

  React.useLayoutEffect(() => {
    window.scroll(0, scrollPos);
  }, [scrollPos]);

  const loadDescriptionsByCategory = categoryName => {
    const categoryNeedsDescriptions =
      // if category is empty request it immediately
      // (this will build the categories too)
      Object.entries(policyObject[categoryName].children)[0] === undefined
        ? true
        : // if the category exists, check if there is at least one
          // description already in the first subcategory
          Object.keys(
            Object.entries(policyObject[categoryName].children)[0][1].children
          ).length === 0;

    if (categoryNeedsDescriptions) {
      console.log("loadDescriptionsByCategory");
      const filters = {
        iso3: [iso3],
        [CATEGORY_FIELD_NAME]: [categoryName],
      };

      if (state !== "national") {
        filters["area1"] = [state];
      }

      loadPolicyDescriptions({ filters, stateSetter: props.setPolicyObject });
    }
  };

  const loadDescriptionsBySubCategory = (categoryName, subcatName) => {
    const subCategoryNeedsDescriptions =
      policyObject[categoryName] === undefined
        ? true
        : policyObject[categoryName].children[subcatName] === undefined ||
          Object.keys(policyObject[categoryName].children[subcatName].children)
            .length === 0;

    if (subCategoryNeedsDescriptions) {
      console.log("loadDescriptionsBySubCategory");
      const filters = {
        iso3: [iso3],
        [CATEGORY_FIELD_NAME]: [categoryName],
        [SUBCATEGORY_FIELD_NAME]: [subcatName],
      };

      if (state !== "national") {
        filters["area1"] = [state];
      }

      loadPolicyDescriptions({ filters, stateSetter: props.setPolicyObject });
    }
  };

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
            counties={["Unspecified"]}
          />
        </div>
      </section>
      <section className={styles.caseloadPlot}>
        <CaseloadPlot caseload={props.caseload} />
      </section>
      <section className={styles.policyList}>
        {policyObject &&
          Object.entries(policyObject).map(([categoryName, category]) => (
            <div className={styles.topLevelContainer} key={categoryName}>
              <ExpandingSection
                open={openSections.firstLevel.includes(categoryName)}
                onOpen={() => {
                  loadDescriptionsByCategory(categoryName);
                  setOpenSections(prev => ({
                    ...prev,
                    firstLevel: [...prev.firstLevel, categoryName],
                  }));
                }}
                onClose={() => {
                  setOpenSections(prev => ({
                    ...prev,
                    firstLevel: prev.firstLevel.filter(
                      name => name !== categoryName
                    ),
                  }));
                }}
              >
                <div className={styles.topLevelHeader}>
                  <PolicyCategoryIcon category={categoryName} />
                  <ExpandMarker
                    arrowColor={"#29334B"}
                    backgroundColor={"#ffffff"}
                    open={openSections.firstLevel.includes(categoryName)}
                  />
                  <h1>
                    {titleCase(categoryName)} <span>({category.count})</span>
                  </h1>
                </div>
                <div className={styles.categoryContainer}>
                  {Object.entries(category.children).map(
                    ([subcatName, subcat]) => (
                      <ExpandingSection
                        key={subcatName}
                        open={openSections.secondLevel.includes(subcatName)}
                        onOpen={() => {
                          loadDescriptionsBySubCategory(
                            categoryName,
                            subcatName
                          );
                          setOpenSections(prev => ({
                            ...prev,
                            secondLevel: [...prev.secondLevel, subcatName],
                          }));
                        }}
                        onClose={() => {
                          setOpenSections(prev => ({
                            ...prev,
                            secondLevel: prev.secondLevel.filter(
                              name => name !== subcatName
                            ),
                          }));
                        }}
                      >
                        <div className={styles.secondLevelHeader}>
                          <div className={styles.markerDot} />
                          <ExpandMarker
                            arrowColor={"#ffffff"}
                            backgroundColor={"#7fb0b4"}
                            open={openSections.secondLevel.includes(subcatName)}
                          />
                          <h2>
                            {titleCase(subcatName)}{" "}
                            <span>({subcat.count})</span>
                          </h2>
                        </div>
                        <div className={styles.secondLevelContainer}>
                          {Object.entries(subcat.children).map(
                            ([policyID, policy]) => (
                              <PolicySummary
                                location={{ iso3, state }}
                                key={policyID}
                                id={policyID.replace("ID", "")}
                                policy={policy}
                                setScrollPos={setScrollPos}
                              />
                            )
                          )}
                        </div>
                      </ExpandingSection>
                    )
                  )}
                </div>
              </ExpandingSection>
            </div>
          ))}
      </section>
    </article>
  );
};

export default ListPoliciesPage;
