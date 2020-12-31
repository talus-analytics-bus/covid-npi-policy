import React from "react";

import {
  loadPolicyDescriptions,
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { extendObjectByPath } from "../../objectPathTools";

import ExpandingSection from "./ExpandingSection/ExpandingSection";
import ExpandMarker from "./ExpandMarker/ExpandMarker";
import PolicySummary from "./PolicySummary/PolicySummary";
import PolicyCategoryIcon from "./PolicyCategoryIcon/PolicyCategoryIcon";

import NDepthList from "./NDepthList/NDepthList";

import styles from "./PolicyList.module.scss";

const articles = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/;

let capitalizeLetter = (word, index) => {
  if (/[a-z, A-Z]/.test(word.charAt(index))) {
    return (
      word.slice(0, index) +
      word.charAt(index).toUpperCase() +
      word.slice(index + 1, word.length)
    );
  }
  if (index + 1 > word.length) return word;
  return capitalizeLetter(word, index + 1);
};

let titleCase = string =>
  string
    .split(" ")
    .map(word => (articles.test(word) ? word : capitalizeLetter(word, 0)))
    .join(" ");

const PolicyList = props => {
  const loadDescriptionsByCategory = categoryName => {
    const categoryNeedsDescriptions =
      // if category is empty request it immediately
      // (this will build the categories too)
      Object.entries(props.policyObject[categoryName].children)[0] === undefined
        ? true
        : // if the category exists, check if there is at least one
          // description already in the first subcategory
          Object.keys(
            Object.entries(props.policyObject[categoryName].children)[0][1]
              .children
          ).length === 0;

    if (categoryNeedsDescriptions) {
      console.log("loadDescriptionsByCategory");
      const filters = {
        iso3: [props.location.iso3],
        [CATEGORY_FIELD_NAME]: [categoryName],
      };

      if (props.location.state !== "national") {
        filters["area1"] = [props.location.state];
      }

      loadPolicyDescriptions({ filters, stateSetter: props.setPolicyObject });
    }
  };

  const loadDescriptionsBySubCategory = (categoryName, subcatName) => {
    console.log("loadDescriptionsBySubCategory called");
    const subCategoryNeedsDescriptions =
      props.policyObject[categoryName] === undefined
        ? true
        : props.policyObject[categoryName].children[subcatName] === undefined ||
          Object.keys(
            props.policyObject[categoryName].children[subcatName].children
          ).length === 0;

    console.log(subCategoryNeedsDescriptions);

    if (!subCategoryNeedsDescriptions) {
      console.log("loadDescriptionsBySubCategory");
      const filters = {
        iso3: [props.location.iso3],
        [CATEGORY_FIELD_NAME]: [categoryName],
        level: [subcatName],
      };

      if (props.location.state !== "national") {
        filters["area1"] = [props.location.state];
      }

      console.log(filters);

      loadPolicyDescriptions({ filters, stateSetter: props.setPolicyObject });
    }
  };

  const renderExpandingSection = (path, obj, children) => (
    <ExpandingSection
      key={path}
      open={obj.open}
      onOpen={() => {
        console.log(`clicked list section ${path.slice(-1)[0]}`);
        loadDescriptionsBySubCategory(path[0], path[2]);
        props.setPolicyObject(prev => {
          extendObjectByPath({
            obj: prev,
            path: path,
            valueObj: { open: true },
          });
          return { ...prev };
        });
      }}
      onClose={() => {
        props.setPolicyObject(prev => {
          extendObjectByPath({
            obj: prev,
            path: path,
            valueObj: { open: false },
          });
          return { ...prev };
        });
      }}
    >
      <div className={styles.secondLevelHeader}>
        <div className={styles.markerDot} />
        <ExpandMarker
          arrowColor={"#ffffff"}
          backgroundColor={"#7fb0b4"}
          open={obj.open}
        />
        <h2>
          {titleCase(path.slice(-1)[0])} <span>({obj.count})</span>
        </h2>
      </div>
      <div className={styles.secondLevelContainer}>{children}</div>
    </ExpandingSection>
  );

  const renderPolicySummary = (path, obj) => (
    <PolicySummary
      key={path}
      location={{
        iso3: props.location.iso3,
        state: props.location.state,
      }}
      id={path.slice(-1)[0].replace("ID", "")}
      policy={obj}
      setScrollPos={props.setScrollPos}
    />
  );

  // console.log(props.policyObject);

  return (
    <section className={styles.policyList}>
      {props.policyObject &&
        Object.entries(props.policyObject).map(([categoryName, category]) => (
          <div className={styles.topLevelContainer} key={categoryName}>
            <ExpandingSection
              open={category.open}
              onOpen={() => {
                loadDescriptionsByCategory(categoryName);
                props.setPolicyObject(prev => {
                  extendObjectByPath({
                    obj: prev,
                    path: [categoryName],
                    valueObj: { open: true },
                  });
                  return { ...prev };
                });
              }}
              onClose={() => {
                props.setPolicyObject(prev => {
                  extendObjectByPath({
                    obj: prev,
                    path: [categoryName],
                    valueObj: { open: false },
                  });
                  return { ...prev };
                });
              }}
            >
              <div className={styles.topLevelHeader}>
                <PolicyCategoryIcon category={categoryName} />
                <ExpandMarker
                  arrowColor={"#29334B"}
                  backgroundColor={"#ffffff"}
                  open={category.open}
                />
                <h1>
                  {titleCase(categoryName)} <span>({category.count})</span>
                </h1>
              </div>
              <div className={styles.categoryContainer}>
                <NDepthList
                  // object whose keys we want to enumerate
                  obj={category}
                  // the pattern which will match keys at n depth
                  idPattern={/^ID/}
                  // starting path
                  path={[categoryName]}
                  // the function to render keys up to n-1
                  renderCategory={renderExpandingSection}
                  // the function to render the object whose
                  // key matches the idPattern
                  renderItem={renderPolicySummary}
                />
              </div>
            </ExpandingSection>
          </div>
        ))}
    </section>
  );
};

export default PolicyList;
