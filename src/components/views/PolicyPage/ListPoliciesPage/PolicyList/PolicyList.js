import React from "react";
import { useLocation } from "react-router-dom";

import {
  loadPolicyDescriptions,
  CATEGORY_FIELD_NAME,
  // SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import {
  extendObjectByPath,
  getFirstPathFromObject,
} from "../../objectPathTools";

import ExpandingSection from "./ExpandingSection/ExpandingSection";
import ExpandMarker from "./ExpandMarker/ExpandMarker";
import PolicyCategory from "./PolicyCategory/PolicyCategory";
import PolicySummary from "../../PolicySummary/PolicySummary";
import PolicyCategoryIcon from "../../PolicyCategoryIcon/PolicyCategoryIcon";

import NDepthList from "./NDepthList/NDepthList";

import styles from "./PolicyList.module.scss";

const articles = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/;

const capitalizeLetter = (word, index) => {
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

export const titleCase = string =>
  string
    .split(" ")
    .map(word => (articles.test(word) ? word : capitalizeLetter(word, 0)))
    .join(" ");

const PolicyList = props => {
  const location = useLocation();

  const loadDescriptionsByCategory = (obj, categoryName) => {
    const firstPath = getFirstPathFromObject({
      obj: obj,
      idPattern: /^ID/,
    });

    if (firstPath.slice(-1)[0] === undefined) {
      const [iso3, state] = location.pathname.split("/").slice(-2);
      console.log(location.pathname.split("/"));

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

  return (
    <section className={styles.policyList}>
      {props.policyObject &&
        Object.entries(props.policyObject).map(([categoryName, category]) => (
          <div className={styles.topLevelContainer} key={categoryName}>
            <ExpandingSection
              open={category.open}
              onOpen={() => {
                loadDescriptionsByCategory(category, categoryName);
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
                  {titleCase(categoryName)}{" "}
                  <span>
                    (total: {category.count}, active: {category.active})
                  </span>
                </h1>
              </div>
              <div className={styles.categoryContainer}>
                {!category.children && (
                  <p style={{ paddingLeft: 38 }}>Loading...</p>
                )}
                <NDepthList
                  // object whose keys we want to enumerate
                  obj={category}
                  // the pattern which will match keys at n depth
                  idPattern={/^ID/}
                  // starting path
                  path={[categoryName]}
                  // the function to render keys up to n-1
                  renderCategory={(path, obj, children) => (
                    <PolicyCategory
                      key={path}
                      {...{ path, obj, children }}
                      setPolicyObject={props.setPolicyObject}
                    />
                  )}
                  // the function to render the object whose
                  // key matches the idPattern
                  renderItem={(path, obj) => (
                    <PolicySummary
                      key={path}
                      path={path}
                      policy={obj}
                      setScrollPos={props.setScrollPos}
                      wordLimit={50}
                    />
                  )}
                />
              </div>
            </ExpandingSection>
          </div>
        ))}
    </section>
  );
};

export default PolicyList;
