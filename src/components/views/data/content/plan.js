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
        label: "Organization type",
      },
    },
    {
      // country_name: {
      //   entity_name: "Place",
      //   field: "country_name",
      //   label: "Country",
      // },
      area1: {
        entity_name: "Place",
        field: "area1",
        label: "State / Province",
        withGrouping: true,
        // primary: "country_name",
        disabledText: "Choose a country",
      },
      area2: {
        entity_name: "Place",
        field: "area2",
        label: "Locality (county, city, ...)",
        withGrouping: true,
        primary: "area1",
        disabledText: "Choose a state / province",
      },
    },
    {
      date_issued: {
        entity_name: "Plan",
        field: "date_issued",
        label: "Date plan issued",
        dateRange: true,
        minMaxDate: { min: undefined, max: undefined },
      },
    },
  ],
  getColumns: ({ metadata, setOrdering }) => {
    // define initial columns which will be updated using the metadata
    const newColumns = [
      { dataField: "org_name", header: "Organization name", sort: true },
      { dataField: "org_type", header: "Org. type", sort: true },
      { dataField: "primary_loc", header: "Org. location", sort: true },
      {
        dataField: "name_and_desc",
        header: "Policy name and description",
        defCharLimit: 1000,
        sort: true,
        formatter: (cell, row) => {
          return <ShowMore text={cell} charLimit={200} />;
        },
      },
      {
        dataField: "date_issued",
        header: "Date issued",
        sort: true,
        formatter: v =>
          v !== null ? moment(v).format("MMM D, YYYY") : unspecified,
      },
      {
        dataField: "file",
        header: "Link",
        formatter: (row, cell) => {
          if (cell.file === undefined) return "";
          const icons = cell.file.map((d, i) => {
            const isLocalDownload = true;
            const link = undefined;
            const hasLink = link && link !== "";
            if (isLocalDownload) {
              const localDownloadLink =
                d !== undefined
                  ? "/get/file/redirect?id=" + d.toString()
                  : undefined;
              return (
                <div
                  key={localDownloadLink + "-" + i}
                  className={styles.linkIcon}
                >
                  <a target="_blank" href={`${API_URL}${localDownloadLink}`}>
                    <i className={"material-icons"}>insert_drive_file</i>
                  </a>
                </div>
              );
            } else if (hasLink) {
              return (
                <div className={styles.linkIcon}>
                  <a target="_blank" href={link}>
                    <i className={"material-icons"}>link</i>
                  </a>
                </div>
              );
            } else return unspecified;
          });
          if (cell.file && cell.file.length > 0) {
            return <div className={styles.linkIcons}>{icons}</div>;
          } else {
            return unspecified;
          }
        },
      },
    ];

    // join elements of metadata to cols, like definitions, etc.
    // and perform some data processing
    // TODO move static data processing into initial declaration of `newColumns`
    newColumns.forEach(d => {
      // add onSort function to update ordering info for API call
      d.onSort = (field, order) => {
        setOrdering([[field, order]]);
      };

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
      if (d.dataField === "name_and_desc") {
        d.definition = "The name and a written description of the plan.";
      }
    });
    return newColumns;
  },

  // nouns to use when referring to entity (sing and plur)
  nouns: { s: "Plan", p: "Plans" },

  // query to use when getting entity data
  // requires method and filters arguments
  dataQuery: ({ method, filters, page = 1, pagesize = 5, ordering = [] }) => {
    return Plan({
      method,
      filters,
      page,
      pagesize,
      ordering,
      fields: [
        "id",
        "source_id",
        "name",
        "org_type",
        "org_name",
        "name_and_desc",
        "date_issued",
        "primary_loc",
        "place",
        "file",
      ],
    });
  },

  // default field to sort tabular data by
  defaultSortedField: "date_issued",

  // JSX of content of table cells if data are unspecified, i.e., blank
  unspecified,
};

export default planInfo;
