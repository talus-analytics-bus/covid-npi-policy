/*
 * Define all necessary information to display Policy instances and filter them
 * on the Data page. Check `plan.js` for the corresponding information for
 * working with Plan instances.
 */
import React from "react";

// common compoments
import { ShowMore } from "../../../common";

// queries
import { Challenge } from "api/Queries";

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

const undefinedValues = [null, undefined, ""];

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
      policy_categories: {
        entity_name: "Court_Challenge",
        field: "policy_categories",
        label: "Policy category",
      },
    },
    {
      government_order_upheld_or_enjoined: {
        entity_name: "Court_Challenge",
        field: "government_order_upheld_or_enjoined",
        label: "Upheld or enjoined?",
      },
    },
    {
      date_of_complaint: {
        entity_name: "Court_Challenge",
        field: "date_of_complaint",
        label: (
          <>
            Complaint date
            <br />
            <i style={{ fontWeight: "normal" }}>(select range)</i>
          </>
        ),
        labelShort: "Complaint date",
        dateRange: true,
        minMaxDate: { min: undefined, max: undefined },
        params: {
          startDatePlaceholder: "Earliest",
          endDatePlaceholder: "Latest",
        },
      },
      date_of_decision: {
        entity_name: "Court_Challenge",
        field: "date_of_decision",
        label: (
          <>
            Decision date
            <br />
            <i style={{ fontWeight: "normal" }}>(select range)</i>
          </>
        ),
        labelShort: "Decision date",
        dateRange: true,
        minMaxDate: { min: undefined, max: undefined },
        params: {
          startDatePlaceholder: "Earliest",
          endDatePlaceholder: "Latest",
        },
      },
    },
    // {
    //   complaint_category_new: {
    //     entity_name: "Court_Challenge",
    //     field: "complaint_category_new",
    //     label: "Complaint category (fake)",
    //   },
    // },
    // {
    //   complaint_subcategory_new: {
    //     entity_name: "Court_Challenge",
    //     field: "complaint_subcategory_new",
    //     label: "Complaint subcategory (fake)",
    //     withGrouping: true,
    //     primary: "complaint_category_new",
    //     disabledText: "Choose a complaint category",
    //   },
    // },
  ],
  getColumns: ({ metadata, setOrdering }) => {
    // define initial columns which will be updated using the metadata
    const newColumns = [
      {
        dataField: "jurisdiction",
        header: "Jurisdiction",
        definition: "Location and court",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        get sortValue() {
          return this.formatter;
        },
        formatter: (cell, row) => {
          let value = "";
          // list jurisdiction and/or court, as available
          const hasJuris = !undefinedValues.includes(row.jurisdiction);
          const hasCourt = !undefinedValues.includes(row.court);

          if (hasJuris) {
            value = row.jurisdiction;
            if (hasCourt) value += `, ${row.court}`;
          } else if (hasCourt) value = row.court;
          else value = unspecified;
          return value;
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
        dataField: "parties_or_citation_and_summary_of_action",
        header: "Case details",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        definition: "Parties, citation & summary of action",
        sort: true,
        get sortValue() {
          return this.formatter;
        },
        formatter: (cell, row) => {
          const hasPar = !undefinedValues.includes(row.parties);
          const hasCit = !undefinedValues.includes(row.legal_citation);
          const hasNum = !undefinedValues.includes(row.case_number);
          const hasSum = !undefinedValues.includes(row.summary_of_action);

          // get parties
          let parties;
          if (hasPar)
            parties = <i style={{ position: "static" }}>{row.parties}</i>;
          else
            parties = (
              <i style={{ position: "static" }}>Parties in progress; </i>
            );

          // get citation or number
          let citOrNum;
          if (hasCit) citOrNum = row.legal_citation;
          else if (hasNum) citOrNum = row.case_number;
          else citOrNum = "Citation in progress";

          // get summary
          let sum;
          if (hasSum)
            sum = <ShowMore text={row.summary_of_action} charLimit={200} />;
          else
            sum = (
              <i className={styles.unspecified} style={{ position: "static" }}>
                Summary in progress
              </i>
            );
          if (hasPar || hasCit || hasNum || hasSum) {
            const jsx = (
              <p>
                <b>
                  {parties}&nbsp;
                  {citOrNum}
                </b>
                <br />
                {sum}
              </p>
            );
            return jsx;
          } else return unspecified;
        },
      },
      // {
      //   dataField: "government_order_upheld_or_enjoined",
      //   header: "Case status",
      //   definition: "Procedural status of the case",
      //   onSort: (field, order) => {
      //     setOrdering([[field, order]]);
      //   },
      //   sort: true,
      //   sortValue: (cell, row) => {
      //     if (row.place !== undefined)
      //       return row.place.map(d => d.level).join("; ");
      //     else return "zzz";
      //   },
      //   formatter: (cell, row) => {
      //     return cell !== "" ? cell : "Pending";
      //   },
      // },
      {
        dataField: "government_order_upheld_or_enjoined",
        header: "Policy and case status",
        definition: "Challenged policy status and procedural status of case",
        onSort: (field, order) => {
          setOrdering([[field, order]]);
        },
        sort: true,
        get sortValue() {
          return this.formatter;
        },
        formatter: (cell, row) => {
          const hasPolicyStatus = !undefinedValues.includes(row.policy_status);
          const hasCaseStatus = !undefinedValues.includes(row.case_status);
          let value = "";
          if (hasPolicyStatus) {
            value = row.policy_status;
            if (hasCaseStatus) value += `: ${row.case_status}`;
            else value += "; case status unspecified";
          } else if (hasCaseStatus) {
            value = `Policy status unspecified: ${row.case_status}`;
          } else
            return (
              <i className={styles.unspecified} style={{ position: "static" }}>
                Data collection in progress
              </i>
            );
          // } else return unspecified;
          return value;
        },
      },
      {
        dataField: "data_source_for_complaint",
        header: "Sources",
        definition: "Link to primary sources",
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
      // {
      //   dataField: "date_of_complaint",
      //   header: "Date of complaint",
      //   sort: true,
      //   onSort: (field, order) => {
      //     setOrdering([[field, order]]);
      //   },
      //   formatter: v =>
      //     v !== null ? moment(v).format("MMM D, YYYY") : not_available,
      // },
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
      d.defCharLimit = 1e6;
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

      if (d.definition === undefined) {
        d.definition = "";
        if (metadata[key] !== undefined) {
          if (
            metadata[key].tooltip !== "" &&
            metadata[key].tooltip !== undefined
          ) {
            d.definition = metadata[key].tooltip;
          } else if (
            metadata[key].definition !== "" &&
            metadata[key].definition !== undefined
          ) {
            d.definition = metadata[key].definition;
          }
        }
      }

      // use only the first sentence of the definition
      if (d.dataField !== "authority_name")
        d.definition = d.definition.split(".")[0];

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
        "filed_in_state_or_federal_court",
        "government_order_upheld_or_enjoined",
        "policy_or_law_name",
        "date_of_complaint",
        "date_of_decision",
        "data_source_for_complaint",
        "data_source_for_decision",
        "holding",
        "legal_citation",
        "summary_of_action",
        "parties",
        "policy_status",
        "case_status",
      ],
    });
  },

  // default field to sort tabular data by
  defaultSortedField: "date_of_complaint",

  // JSX of content of table cells if data are unspecified, i.e., blank
  unspecified,
};

export default policyInfo;
