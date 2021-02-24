/*
 * Define all necessary information to display Policy instances and filter them
 * on the Data page. Check `plan.js` for the corresponding information for
 * working with Plan instances.
 */
import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";

// common compoments
import { ShowMore } from "../../../common";

// queries
import { Policy } from "../../../misc/Queries";

// assets and styles
// use same styles as main Data page
import styles from "../data.module.scss";
import PolicyLink, {
  parseNameAndDesc,
} from "../../../common/PolicyLink/PolicyLink";

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
             level: {
               entity_name: "Place",
               field: "level",
               label: "Level of government",
               tooltip: (
                 <>
                   <p>
                     Choose a level of government to see only policies that
                     affect locations belonging to that level. For example,
                     choosing the <strong>Country</strong> level will show only
                     policies that apply to an entire country.
                   </p>
                   <p>
                     As another example, choosing the <strong>Local</strong>{" "}
                     level while filtering by the United States state of
                     California will show only policies affecting local areas
                     (e.g., counties) in California, and so on.{" "}
                     <a
                       href={`/data?type=policy&filters_policy=%7B"country_name"%3A%5B"United+States+of+America+%28USA%29"%5D%2C"area1"%3A%5B"California"%5D%2C"level"%3A%5B"Local"%5D%7D`}
                     >
                       Click here to try that search now
                     </a>
                     .
                   </p>
                 </>
               ),
             },
           },
           {
             subtarget: {
               entity_name: "Policy",
               field: "subtarget",
               label: "Target(s)",
             },
           },
           // {
           //   relaxing_or_restricting: {
           //     entity_name: "Policy",
           //     field: "relaxing_or_restricting",
           //     label: "Relaxing or restricting",
           //   },
           // },
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
         getColumns: ({ metadata, setOrdering }) => {
           // define initial columns which will be updated using the metadata
           const newColumns = [
             {
               dataField: "place.loc",
               defKey: "place.loc",
               header: "Affected location",
               defCharLimit: 1000,
               sort: true,
               onSort: (field, order) => {
                 setOrdering([[field, order]]);
               },
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
               dataField: "place.level",
               defKey: "place.level",
               header: "Level of government",
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
                 if (row.place !== undefined && row.place.length > 0)
                   return row.place[0].level;
                 else return null;
               },
             },
             {
               dataField: "name_and_desc",
               header: "Policy name and description",
               defCharLimit: 1000,
               sort: true,
               onSort: (field, order) => {
                 setOrdering([["name_and_desc", order]]);
               },
               formatter: (cell, row) => {
                 const nameAndDesc = parseNameAndDesc(
                   row.policy_name,
                   row.desc
                 );
                 return (
                   <>
                     <PolicyLink
                       {...{
                         aText: nameAndDesc.name,
                         policyDatum: row,
                         suffix: ": ",
                       }}
                     />
                     <ShowMore text={nameAndDesc.desc} charLimit={200} />
                   </>
                 );
               },
             },
             {
               dataField: "primary_ph_measure",
               header: "Policy category",
               sort: true,
               onSort: (field, order) => {
                 setOrdering([[field, order]]);
               },
             },
             {
               dataField: "date_start_effective",
               header: "Effective start date",
               sort: true,
               onSort: (field, order) => {
                 setOrdering([[field, order]]);
               },
               formatter: v =>
                 v !== null ? moment(v).format("MMM D, YYYY") : unspecified,
             },
             {
               dataField: "subtarget",
               header: "Target(s)",
               sort: true,
               onSort: (field, order) => {
                 setOrdering([[field, order]]);
               },
               formatter: v => {
                 const text = v.map(d => d.replaceAll("/", " / ")).join("; ");
                 return <ShowMore {...{ text, charLimit: 100 }} />;
               },
             },
             // {
             //   dataField: "authority_name",
             //   header: "Relevant authority",
             //   sort: true,
             //   onSort: (field, order) => {
             //     setOrdering([[field, order]]);
             //   },
             //   formatter: v => {
             //     // TODO REPLACE ALL
             //     if (v === undefined) return "";
             //     return <ShowMore text={v.replace("_", " ")} charLimit={90} />;
             //   },
             // },
             {
               dataField: "file",
               header: "PDF / Link",
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
                         <a
                           target="_blank"
                           href={`${API_URL}${localDownloadLink}`}
                         >
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
             if (d.dataField === "subtarget")
               d.definition =
                 "The primary population, location or entities impacted";
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
         }) => {
           return Policy({
             method,
             filters,
             page,
             pagesize,
             ordering,
             fields: [
               "id",
               "place",
               "primary_ph_measure",
               "subtarget",
               "policy_name",
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
