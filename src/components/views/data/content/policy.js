/*
 * Define all necessary information to display Policy instances and filter them
 * on the Data page. Check `plan.js` for the corresponding information for
 * working with Plan instances.
 */
import React from "react";
import moment from "moment";

// common compoments
import { ShowMore } from "../../../common";
import { getOnSort } from "./helpers";

// queries
import { Policy } from "api/Queries";

// assets and styles
// use same styles as main Data page
import styles from "../data.module.scss";
import {
  getLinkedPolicyTitle,
  getPolicyCatSubcatTarg,
  formatFiltersForPlaceType,
} from "./helpers";

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
      country_name: {
        entity_name: "Place",
        field: "country_name",
        label: "Country / Tribal nation",
        withGrouping: true,
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
      level: {
        entity_name: "Place",
        field: "level",
        label: "Geographic level",
        advanced: true,
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
        label: "Policy subcategory",
        withGrouping: true,
        primary: "primary_ph_measure",
        disabledText: "Choose a policy category",
      },
    },
    {
      subtarget: {
        entity_name: "Policy",
        field: "subtarget",
        label: "Policy target",
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
  getColumns: ({ metadata, setOrdering, placeType }) => {
    const onSort = getOnSort(setOrdering);
    // define initial columns which will be updated using the metadata
    const newColumns = [
      // {
      //   dataField: "place.level",
      //   defKey: "place.level",
      //   header: "Type of affected location",
      //   placeType: "affected",
      //   onSort: (field, order) => {
      //     setOrdering([[field, order]]);
      //   },
      //   sort: true,
      //   sortValue: (_cell, row) => {
      //     if (row.place !== undefined)
      //       return row.place.map(d => d.level).join("; ");
      //     else return "zzz";
      //   },
      //   formatter: (_cell, row) => {
      //     if (row.place !== undefined && row.place.length > 0)
      //       return row.place[0].level;
      //     else return null;
      //   },
      // },
      {
        dataField: "place.loc",
        defKey: "place.loc",
        header: "Affected location",
        placeType: "affected",
        defCharLimit: 1000,
        sort: true,
        onSort,
        sortValue: () => 0,
        formatter: (_cell, row) => {
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
        dataField: "auth_entity.place.loc",
        defKey: "auth_entity.place.loc",
        header: "Jurisdiction",
        placeType: "jurisdiction",
        defCharLimit: 1000,
        sort: true,
        onSort,
        sortValue: () => 0,
        formatter: (_cell, row) => {
          if (row.auth_entity !== undefined)
            return (
              <ShowMore
                text={row.auth_entity.map(ae => ae.place.loc).join("; ")}
                charLimit={60}
              />
            );
          else return null;
        },
      },
      {
        dataField: "auth_entity.place.level",
        defKey: "auth_entity.place.level",
        header: "Type of jurisdiction",
        // placeType: "jurisdiction",
        onSort,
        sort: true,
        sortValue: () => 0,
        formatter: (_cell, row) => {
          if (row.auth_entity !== undefined)
            return row.auth_entity.map(ae => ae.place.level).join("; ");
          else return null;
        },
      },
      {
        dataField: "name_and_desc",
        header: "Policy name and description",
        defCharLimit: 1000,
        formatter: (_cell, row) => {
          const desc = row.desc;
          return (
            <p>
              <span style={{ fontWeight: 600 }}>
                {getLinkedPolicyTitle(row)}
              </span>
              <br />
              <ShowMore text={desc} charLimit={200} />
            </p>
          );
        },
      },
      {
        dataField: "primary_ph_measure",
        header: "Policy category, subcategory, and targets",
        formatter: (_cell, row) => getPolicyCatSubcatTarg(row),
      },
      {
        dataField: "date_start_effective",
        header: "Effective start date",
        sort: true,
        onSort,
        sortValue: () => 0,
        formatter: v =>
          v !== null ? moment(v).format("MMM D, YYYY") : unspecified,
      },
      {
        dataField: "authority_name",
        header: "Relevant authority",
        formatter: v => {
          // TODO REPLACE ALL
          if (v === undefined) return "";
          return <ShowMore text={v.replace("_", " ")} charLimit={90} />;
        },
      },
      {
        dataField: "file",
        header: "PDF / Link",
        sortValue: () => 0,
        formatter: (_cell, row) => {
          if (row.file === undefined) return "";
          const icons = row.file.map((d, i) => {
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
                  <a
                    target="_blank"
                    href={`${API_URL}${localDownloadLink}`}
                    rel="noreferrer"
                  >
                    <i className={"material-icons"}>insert_drive_file</i>
                  </a>
                </div>
              );
            } else if (hasLink) {
              return (
                <div className={styles.linkIcon}>
                  <a target="_blank" href={link} rel="noreferrer">
                    <i className={"material-icons"}>link</i>
                  </a>
                </div>
              );
            } else return unspecified;
          });
          if (row.file && row.file.length > 0) {
            return <div className={styles.linkIcons}>{icons}</div>;
          } else {
            return unspecified;
          }
        },
      },
    ].filter(d => d.placeType === undefined || d.placeType === placeType);

    // join elements of metadata to cols, like definitions, etc.
    // and perform some data processing
    // TODO move static data processing into initial declaration of `newColumns`
    newColumns.forEach(d => {
      // static update to definition
      // TODO move static data processing into initial declaration
      // of `newColumns`
      if (d.dataField === "file") {
        d.definition = "";
        return;
      }

      // definition updates
      const keyTmp = d.defKey || d.dataField;
      const key = keyTmp.includes(".") ? keyTmp : "policy." + keyTmp;
      d.definition = metadata[key] ? metadata[key].definition || "" : "";

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
  nouns: { s: "Policy", p: "Policies" },

  // query to use when getting entity data
  // requires method and filters arguments
  dataQuery: ({
    method,
    filters,
    page = 1,
    pagesize = 5,
    ordering = [],
    placeType,
  }) => {
    if (placeType === undefined)
      throw Error("Argument `placeType` is required.");
    else {
      const filtersForRequest = formatFiltersForPlaceType(filters, placeType);
      return Policy({
        method,
        filters: filtersForRequest,
        page,
        pagesize,
        ordering,
        fields: [
          "id",
          "place",
          "auth_entity",
          "primary_ph_measure",
          "ph_measure_details",
          "subtarget",
          "authority_name",
          "policy_name",
          "desc",
          "date_start_effective",
          "file",
        ],
      });
    }
  },

  // default field to sort tabular data by
  defaultSortedField: "date_start_effective",

  // JSX of content of table cells if data are unspecified, i.e., blank
  unspecified,
};

export default policyInfo;
