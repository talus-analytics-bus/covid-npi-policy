/*
 * Define all necessary information to display Policy instances and filter them
 * on the Data page. Check `plan.js` for the corresponding information for
 * working with Plan instances.
 */
import React from "react";
import moment from "moment";

// common compoments
import { ShowMore } from "../../../common";

// queries
import { Challenge } from "../../../misc/Queries";

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
export const policyInfo = {
  filterDefs: [
    {
      jurisdiction: {
        entity_name: "Court_Challenge",
        field: "jurisdiction",
        label: "Jurisdiction",
      },
    },
    {
      court: {
        entity_name: "Court_Challenge",
        field: "court",
        label: "Court",
      },
    },
    {
      complaint_date_range: {
        entity_name: "Court_Challenge",
        field: "dates_in_effect",
        label: "Complaint Date Range",
        dateRange: true,
        minMaxDate: { min: undefined, max: undefined },
      },
    },
  ],
  getColumns: ({ metadata, setOrdering }) => {
    // define initial columns which will be updated using the metadata
    const newColumns = [
      {
        dataField: "case_name",
        header: "Case Name",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        // formatter: (cell, row) => {
        //   console.log(row);
        //   return row.case_name;
        // },
      },
      {
        dataField: "case_number",
        header: "Case Number",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        // formatter: (cell, row) => {
        //   console.log(row);
        //   return row;
        // },
      },
      {
        dataField: "court",
        header: "Court",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        // formatter: (cell, row) => {
        //   console.log(row);
        //   return row;
        // },
      },
      {
        dataField: "parties",
        header: "Parties",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        // formatter: (cell, row) => {
        //   console.log(row);
        //   return row;
        // },
      },
      {
        dataField: "date_of_complaint",
        header: "Date of Complaint",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        // formatter: (cell, row) => {
        //   console.log(row);
        //   return row;
        // },
      },
    ];

    // join elements of metadata to cols, like definitions, etc.
    // and perform some data processing
    // TODO move static data processing into initial declaration of `newColumns`
    newColumns.forEach(d => {
      // static update to definition
      // TODO move static data processing into initial declaration
      // of `newColumns`
      if (d.dataField === "file") {
        d.definition = "PDF download of or external link to policy";
        return;
      }

      // definition updates
      const keyTmp = d.defKey || d.dataField;
      const key = keyTmp.includes(".") ? keyTmp : "policy." + keyTmp;
      d.definition = metadata[key] ? metadata[key].definition || "" : "";

      // use only the first sentence of the definition
      if (d.dataField !== "authority_name")
        d.definition = d.definition.split(".")[0] + ".";

      // special cases
      // TODO move static data processing into initial declaration
      // of `newColumns`
      if (d.dataField === "name_and_desc") {
        d.definition =
          "The name and a written description of the policy or law and who it impacts.";
      }
    });

    return newColumns;
  },

  // nouns to use when referring to entity (sing and plur)
  nouns: { s: "Case", p: "Cases" },

  // query to use when getting entity data
  // requires method and filters arguments
  dataQuery: ({ method, filters, page = 1, pagesize = 5, ordering = [] }) => {
    return Challenge({
      method,
      filters,
      page,
      pagesize,
      ordering,
      fields: [
        "id",
        "matter_numbers",
        "case_name",
        "court",
        "jurisdiction",
        "parties",
        "filed_in_state_or_federal_court",
        "date_of_complaint",
        "date_of_decision",
        "summary_of_action",
        "holding",
      ],
    });
  },

  // default field to sort tabular data by
  defaultSortedField: "case_name",

  // JSX of content of table cells if data are unspecified, i.e., blank
  unspecified,
};

export default policyInfo;
