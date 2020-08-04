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
import { Policy } from "../../../misc/Queries";

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
      level: {
        entity_name: "Place",
        field: "level",
        label: "Level of government",
      },
    },
    {
      country_name: {
        entity_name: "Place",
        field: "country_name",
        label: "Country",
      },
      area1: {
        entity_name: "Place",
        field: "area1",
        label: "State / Province",
        withGrouping: true,
        primary: "country_name",
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
      relaxing_or_restricting: {
        entity_name: "Policy",
        field: "relaxing_or_restricting",
        label: "Relaxing or restricting",
      },
    },
    {
      primary_ph_measure: {
        entity_name: "Policy",
        field: "primary_ph_measure",
        label: "Policy category",
      },
      ph_measure_details: {
        entity_name: "Policy",
        field: "ph_measure_details",
        label: "Policy sub-category",
        withGrouping: true,
        primary: "primary_ph_measure",
        disabledText: "Choose a policy category",
      },
    },
    {
      dates_in_effect: {
        entity_name: "Policy",
        field: "dates_in_effect",
        label: "Dates policy in effect",
        dateRange: true,
        minMaxDate: { min: undefined, max: undefined },
      },
    },
  ],
  getColumns: ({ metadata }) => {
    // define initial columns which will be updated using the metadata
    const newColumns = [
      {
        dataField: "place.level",
        defKey: "place.level",
        header: "Level of government",
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.level).join("; ");
          else return "zzz";
        },
        formatter: (cell, row) => {
          if (row.place !== undefined && row.place.length > 0)
            return row.place[0].level;
          else return null;
        },
      },
      {
        dataField: "place.loc",
        defKey: "place.loc",
        header: "Affected location",
        defCharLimit: 1000,
        sort: true,
        sortValue: (cell, row) => {
          if (row.place !== undefined)
            return row.place.map(d => d.loc).join("; ");
          else return "zzz";
        },
        formatter: (cell, row) => {
          if (row.place !== undefined && row.place.length > 0)
            return (
              <ShowMore
                text={row.place.map(d => d.loc).join("; ")}
                charLimit={60}
              />
            );
          else return null;
        },
      },
      {
        dataField: "desc",
        header: "Policy name and description",
        defCharLimit: 1000,
        sort: true,
        formatter: (cell, row) => {
          console.log("row");
          console.log(row);
          const title =
            row.policy_name !== "Unspecified" &&
            row.policy_name !== "" &&
            row.policy_name !== null &&
            row.policy_name !== undefined
              ? row.policy_name + ": "
              : "";
          return <ShowMore text={title + cell} charLimit={200} />;
        },
      },
      {
        dataField: "primary_ph_measure",
        header: "Policy category",
        sort: true,
      },
      {
        dataField: "date_start_effective",
        header: "Effective start date",
        sort: true,
        formatter: v =>
          v !== null ? moment(v).format("MMM D, YYYY") : unspecified,
      },
      {
        dataField: "authority_name",
        header: "Relevant authority",
        sort: true,
        formatter: v => {
          // TODO REPLACE ALL
          if (v === undefined) return "";
          return <ShowMore text={v.replace("_", " ")} charLimit={90} />;
        },
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
      if (d.dataField === "desc") {
        d.definition =
          "The name and a written description of the policy or law and who it impacts.";
      }
    });

    return newColumns;
  },

  // nouns to use when referring to entity (sing and plur)
  nouns: { s: "Policy", p: "Policies" },

  // query to use when getting entity data
  // requires method and filters arguments
  dataQuery: ({ method, filters }) => {
    return Policy({
      method,
      filters,
      fields: [
        "id",
        "place",
        "primary_ph_measure",
        "policy_name",
        "authority_name",
        "desc",
        "date_start_effective",
        "file",
      ],
    });
  },

  // default field to sort tabular data by
  defaultSortedField: "date_start_effective",

  // JSX of content of table cells if data are unspecified, i.e., blank
  unspecified,
};

export default policyInfo;
