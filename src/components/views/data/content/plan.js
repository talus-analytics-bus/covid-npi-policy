/*
 * Define all necessary information to display Plan instances and filter them
 * on the Data page. Check `policy.js` for the corresponding information for
 * working with Plan instances.
 */
import React from "react";
import moment from "moment";

// common compoments
import { ShowMore } from "../../../common";

// queries
import { Plan } from "../../../misc/Queries";

// assets and styles
// use same styles as main Data page
import styles from "../data.module.scss";

// constants
const unspecified = (
  <span className={styles.unspecified}>{"None available"}</span>
);
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Define all info needed in the Data page to fetch and show policies.
 * @type {Object}
 */
export const planInfo = {
  filterDefs: [
    {
      org_type: {
        entity_name: "Plan",
        field: "org_type",
        label: "Organization type"
      }
    }
  ],
  getColumns: metadata => {
    // define initial columns which will be updated using the metadata
    const newColumns = [
      { dataField: "org_type", header: "Organization type", sort: true }
    ];

    // join elements of metadata to cols, like definitions, etc.
    // and perform some data processing
    // TODO move static data processing into initial declaration of `newColumns`
    newColumns.forEach(d => {
      // static update to definition
      // TODO move static data processing into initial declaration
      // of `newColumns`
      if (d.dataField === "file") {
        d.definition = "PDF download of or external link to plan";
        return;
      }

      // definition updates
      const key = d.dataField.includes(".")
        ? d.dataField
        : "plan." + d.dataField;
      d.definition = metadata[key] ? metadata[key].definition || "" : "";

      // use only the first sentence of the definition
      if (d.dataField !== "authority_name")
        d.definition = d.definition.split(".")[0] + ".";

      // special cases
      // TODO move static data processing into initial declaration
      // of `newColumns`
      if (d.dataField === "desc") {
        d.definition = "The name and a written description of the plan.";
      }
    });
    return newColumns;
  },

  // nouns to use when referring to entity (sing and plur)
  nouns: { s: "Plan", p: "Plans" },

  // query to use when getting entity data
  // requires method and filters arguments
  dataQuery: ({ method, filters }) => {
    console.log("Querying plan data...");

    return Plan({
      method,
      filters,
      fields: [
        // "id",
        // "place",
        // "primary_ph_measure",
        // "policy_name",
        // "authority_name",
        // "desc",
        // "date_start_effective",
        // "file"
      ]
    });
  },

  // JSX of content of table cells if data are unspecified, i.e., blank
  unspecified
};

export default planInfo;
