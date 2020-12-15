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
import PolicySummary from "../PolicySummary/PolicySummary";
import PolicyCategoryIcon from "../PolicyCategoryIcon/PolicyCategoryIcon";

import * as MiniMap from "../MiniMap/MiniMap";

import styles from "./ListPoliciesPage.module.scss";

const ListPoliciesPage = props => {
  const { iso3, state } = useParams();

  // unpacking this so the hook dependency
  // will work correctly
  const { setPolicyObject } = props;

  // Get category and subcategory
  // for all policies when component mounts
  React.useEffect(() => {
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
  }, [iso3, state, setPolicyObject]);

  const [openSections, setOpenSections] = props.openSections;
  const [scrollPos, setScrollPos] = props.policyListScrollPos;

  React.useLayoutEffect(() => {
    window.scroll(0, scrollPos);
  }, [scrollPos]);

  const loadDescriptionsByCategory = categoryName => {
    console.log("loadDescriptionsByCategory");

    const categoryNeedsDescriptions =
      // if category is empty request it immediately
      // (this will build the categories too)
      Object.entries(props.policyObject[categoryName])[0] === undefined
        ? true
        : // if the category exists, check if there is at least one
          // description already in the first subcategory
          Object.keys(Object.entries(props.policyObject[categoryName])[0][1])
            .length === 0;

    if (categoryNeedsDescriptions) {
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
      props.policyObject[categoryName] === undefined
        ? true
        : props.policyObject[categoryName][subcatName] === undefined ||
          Object.keys(props.policyObject[categoryName][subcatName]).length ===
            0;

    if (subCategoryNeedsDescriptions) {
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

  // console.log(props.policyObject);
  // console.log(openSections);
  // console.log(scrollPos);

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
            {Object.keys(props.policyObject)
              .map(pm => pm.toLowerCase())
              .slice(0, -1)
              .join(", ")}
            , and{" "}
            {Object.keys(props.policyObject)
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
      <section>
        {props.policyObject &&
          Object.entries(props.policyObject).map(([categoryName, category]) => (
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
                  {/* <div className={styles.icon} /> */}
                  <PolicyCategoryIcon category={categoryName} />
                  <h1>
                    {categoryName}
                    {/* {Object.keys(category).length} */}
                  </h1>
                </div>
                <div className={styles.categoryContainer}>
                  {Object.entries(category).map(([subcatName, subcat]) => (
                    <ExpandingSection
                      key={subcatName}
                      open={openSections.secondLevel.includes(subcatName)}
                      onOpen={() => {
                        loadDescriptionsBySubCategory(categoryName, subcatName);
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
                        <h2>
                          {subcatName}
                          {/* {Object.keys(subcat).length} */}
                        </h2>
                      </div>
                      <div className={styles.secondLevelContainer}>
                        {Object.entries(subcat).map(([policyID, policy]) => (
                          <PolicySummary
                            location={{ iso3, state }}
                            key={policyID}
                            id={policyID.replace("ID", "")}
                            policy={policy}
                            setScrollPos={setScrollPos}
                          />
                        ))}
                      </div>
                    </ExpandingSection>
                  ))}
                </div>
              </ExpandingSection>
            </div>
          ))}
      </section>
    </article>
  );
};

export default ListPoliciesPage;
