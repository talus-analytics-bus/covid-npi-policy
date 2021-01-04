import React from "react";
import { useLocation } from "react-router-dom";

import {
  extendObjectByPath,
  getFirstPathFromObject,
} from "../../../objectPathTools";

import {
  loadPolicyDescriptions,
  CATEGORY_FIELD_NAME,
  // SUBCATEGORY_FIELD_NAME,
} from "../../../PolicyRouter/PolicyLoaders";

import { titleCase } from "../PolicyList";

import ExpandingSection from "../ExpandingSection/ExpandingSection";
import ExpandMarker from "../ExpandMarker/ExpandMarker";

import styles from "./PolicyCategory.module.scss";

const PolicyCategory = props => {
  const location = useLocation();

  const loadDescriptionsBySubCategory = (obj, path) => {
    const firstPath = getFirstPathFromObject({
      obj: obj,
      idPattern: /^ID/,
    });

    if (firstPath.slice(-1)[0] === undefined) {
      const [iso3, state] = location.pathname.split("/").slice(-2);

      const filters = {
        iso3: [iso3],
        [CATEGORY_FIELD_NAME]: [path[0]],
        level: [path[2]],
      };

      if (state !== "national") {
        filters["area1"] = [state];
      }

      loadPolicyDescriptions({ filters, stateSetter: props.setPolicyObject });
    }
  };

  const children = React.Children.toArray(props.children);

  return (
    <ExpandingSection
      open={props.obj.open}
      onOpen={() => {
        loadDescriptionsBySubCategory(props.obj, props.path);
        props.setPolicyObject(prev => {
          extendObjectByPath({
            obj: prev,
            path: props.path,
            valueObj: { open: true },
          });
          return { ...prev };
        });
      }}
      onClose={() => {
        props.setPolicyObject(prev => {
          extendObjectByPath({
            obj: prev,
            path: props.path,
            valueObj: { open: false },
          });
          return { ...prev };
        });
      }}
    >
      <div className={styles.categoryHeader}>
        <ExpandMarker
          arrowColor={"#ffffff"}
          backgroundColor={"#7fb0b4"}
          open={props.obj.open}
        />
        <h2>
          {titleCase(props.path.slice(-1)[0])}{" "}
          <span>
            (total: {props.obj.count}, active: {props.obj.active})
          </span>
        </h2>
      </div>
      <div className={styles.categoryContainer}>
        {children.length > 0 ? (
          children
        ) : (
          <p style={{ paddingLeft: 30 }}>Loading...</p>
        )}
      </div>
    </ExpandingSection>
  );
};

export default PolicyCategory;
