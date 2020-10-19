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
const not_available = (
  <span className={styles.unspecified}>{"Not available"}</span>
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
      complaint_category: {
        entity_name: "Court_Challenge",
        field: "complaint_category",
        label: "Complaint category",
      },
    },
    {
      government_order_upheld_or_enjoined: {
        entity_name: "Court_Challenge",
        field: "government_order_upheld_or_enjoined",
        label: "Upheld?",
      },
    },
    {
      date_of_complaint: {
        entity_name: "Court_Challenge",
        field: "date_of_complaint",
        label: "Complaint date range",
        dateRange: true,
        minMaxDate: { min: undefined, max: undefined },
      },
    },
    {
      date_of_decision: {
        entity_name: "Court_Challenge",
        field: "date_of_decision",
        label: "Decision date range",
        dateRange: true,
        minMaxDate: { min: undefined, max: undefined },
      },
    },
  ],
  getColumns: ({ metadata, setOrdering }) => {
    // define initial columns which will be updated using the metadata
    const newColumns = [
      {
        dataField: "jurisdiction",
        header: "Jurisdiction",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
      },
      {
        dataField: "parties",
        header: "Parties or citation",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        formatter: (cell, row) => {
          if (row.parties !== "") {
            return `${row.parties}`;
          } else {
            return `${row.legal_citation}`;
          }
        },
      },
      {
        dataField: "policy_or_law_name",
        header: "Policy or law name",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        formatter: (cell, row) =>
          cell !== "" ? (
            <ShowMore text={cell} charLimit={100} />
          ) : (
            not_available
          ),
      },
      {
        dataField: "summary_of_action",
        header: "Summary of action",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        formatter: (cell, row) => {
          // remove any text enclosed in square braces (comments)
          const text = cell.replace(/\[.*\]/g, "");
          return text !== "" ? (
            <ShowMore text={text} charLimit={200} />
          ) : (
            not_available
          );
        },
      },
      {
        dataField: "government_order_upheld_or_enjoined",
        header: "Upheld?",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        formatter: (cell, row) => {
          return cell !== "" ? cell : "Pending";
        },
      },
      {
        dataField: "data_source_for_complaint",
        header: "Sources",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        formatter: (cell, row) => {
          const icons = [
            row.data_source_for_complaint,
            row.data_source_for_decision,
          ].map((d, i) => {
            if (
              d !== "" &&
              d !== undefined &&
              d !== null &&
              d.startsWith("http")
            ) {
              return (
                <div className={styles.linkIcon}>
                  <a target="_blank" rel="noopener" href={d}>
                    {["Complaint ", "Decision "][i]}
                    {!d.startsWith("http") ? (
                      <i className={"material-icons"}>insert_drive_file</i>
                    ) : (
                      <i className={"material-icons"}>link</i>
                    )}
                  </a>
                </div>
              );
            } else {
              return "";
            }
          });
          if (
            row.data_source_for_complaint !== "" ||
            row.data_source_for_decision !== ""
          ) {
            return <div className={styles.linkIcons}>{icons}</div>;
          } else {
            return unspecified;
          }
        },
      },
      {
        dataField: "date_of_complaint",
        header: "Date of complaint",
        sort: true,
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        formatter: v =>
          v !== null ? moment(v).format("MMM D, YYYY") : not_available,
      },
      // {
      //   dataField: "date_of_decision",
      //   header: "Date of Decision",
      //   sort: true,
      //   onSort: (field, order) => {
      //     setOrdering([[field, order]]);
      //   },
      //   formatter: v =>
      //     v !== null ? moment(v).format("MMM D, YYYY") : not_available,
      // },
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
      const key = keyTmp.includes(".") ? keyTmp : "court_challenge." + keyTmp;
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
  nouns: { s: "Court_Challenge", p: "Court challenges" },

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
        "case_number",
        "court",
        "jurisdiction",
        "parties",
        "filed_in_state_or_federal_court",
        "policy_or_law_name",
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
