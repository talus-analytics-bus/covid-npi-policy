import { Filters } from "components/common/MapboxMap/plugins/mapTypes";
import {
  DataRecord,
  PlaceRecord,
  PolicyRecord,
} from "components/misc/dataTypes";
import { AuthEntityRecord } from "components/misc/dataTypes";
import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { PlaceType } from "../types";

import styles from "./Helpers.module.scss";

const DEFAULT_POLICY_TITLE: string = "Untitled policy";

/**
 * If a policy has any of these titles then replace it with the default
 */
const INVALID_POLICY_TITLES: string[] = ["", "Unspecified"];

/**
 * Returns a version of the policy title that links to the appropriate policy
 * page, given a policy record.
 * @param {PolicyRecord} p The policy record
 * @returns {string | ReactElement} The linked policy title
 */
export const getLinkedPolicyTitle: Function = (
  p: PolicyRecord
): string | ReactElement => {
  const name = p.policy_name;
  if (name === undefined || name === null) return DEFAULT_POLICY_TITLE;
  else {
    const titleTrimmed: string = name.trim();
    const titleForLink: string = !INVALID_POLICY_TITLES.includes(titleTrimmed)
      ? titleTrimmed
      : DEFAULT_POLICY_TITLE;
    const id = p.id;
    if (id === undefined || id === null) return titleForLink;
    else {
      // get policy URL from place data
      const url: string = getPolicyUrl(p);
      if (url !== null)
        return (
          <Link
            to={url}
            title={"Click link to go to policy details page"}
            target="_blank"
          >
            {titleForLink}
          </Link>
        );
      else return titleForLink;
    }
  }
};

/**
 * Returns the URL for the policy page of the given policy record.
 * @param {PolicyRecord} p The policy record
 * @returns {string | null} The URL to the policy page
 */
export const getPolicyUrl: Function = (p: PolicyRecord): string | null => {
  if (
    p.id === undefined ||
    p.id === null ||
    p.auth_entity === undefined ||
    p.auth_entity.length === 0
  )
    return null;
  else {
    const id: number = p.id;
    const authEntities: AuthEntityRecord[] = p.auth_entity;
    const firstAuth: AuthEntityRecord = authEntities[0];
    if (firstAuth.place === undefined || firstAuth.place === null) return null;
    else {
      const pl: PlaceRecord = firstAuth.place;
      if (
        pl.iso3 === undefined ||
        pl.iso3 === null ||
        pl.level === undefined ||
        pl.level === null
      )
        return null;
      else {
        const iso3: string = pl.iso3;
        const level: string = pl.level;
        if (level !== "Country") {
          if (pl.area1 === undefined || pl.area1 === null) return null;
          else {
            const area1: string = pl.area1;
            return `/policies/${iso3}/${area1}/${id}`;
          }
        } else {
          return `/policies/${iso3}/national/${id}`;
        }
      }
    }
  }
};

/**
 * Any property on the data record type.
 */
type DataRecordField = keyof DataRecord;

/**
 *
 * @param {DataRecord[]} data An array of data records
 * @param {DataRecordField} field Any field on the data record type
 * @returns {string[]} All values (as strings) assigned to the data field --
 * not a unique list.
 */
export function safeGetFieldValsAsStrings(
  data: DataRecord[],
  field: DataRecordField
): string[] {
  return data
    .filter(d => d[field] !== undefined && d[field] !== null)
    .map(d => {
      return (d[field] || "").toString();
    })
    .sort();
}

/**
 * Different modes of policy category, subcategory, and target text that may
 * be displayed.
 */
type PolicyCatSubcatTargMode = "indented" | "declarative" | "simple";

/**
 * Returns a list of categories, subcategories, and targets of a policy from
 * its record (API response datum).
 * @param p The policy record
 * @returns {string} List of categories, subcategories, and targets of
 * the policy.
 */
export function getPolicyCatSubcatTarg(
  p: PolicyRecord,
  mode: PolicyCatSubcatTargMode = "declarative"
): ReactElement | null {
  switch (mode) {
    case "indented":
      return getPolicyCatSubcatTargIndented(p);
    case "declarative":
      return getPolicyCatSubcatTargDeclarative(p);
    case "simple":
    default:
      return getPolicyCatSubcatTargSimple(p);
  }
}

/**
 * Returns a formatted string of subtargets for presentation in the
 * user interface.
 * @param {string} s
 * The string of subtargets
 *
 * @returns {string}
 * A formatted string of subtargets with zero-width spaces padding frontslashes
 */
function formatSubtargets(s: string): string {
  return s.replaceAll(" / ", "/").replaceAll("/", "​/​");
}

/**
 * Returns categories, subcategories, and targets of a policy record as an
 * indented list.
 * @param p The policy record
 * @returns The categories, subcategories, and targets of the policy record
 * presented as an indented list.
 */
function getPolicyCatSubcatTargIndented(p: PolicyRecord): ReactElement | null {
  if (p.primary_ph_measure === undefined || p.primary_ph_measure === null)
    return null;
  else {
    const cat: string = p.primary_ph_measure;
    if (p.ph_measure_details === undefined || p.ph_measure_details === null)
      return <p className={styles.category}>{cat}</p>;
    else {
      const subcat: string = p.ph_measure_details;
      if (
        p.subtarget === undefined ||
        p.subtarget === null ||
        p.subtarget.length === 0
      )
        return (
          <p>
            <p className={styles.category}>{cat}:</p>
            <p className={styles.subcategory}>{subcat}</p>
          </p>
        );
      else {
        return (
          <p className={styles.indented}>
            <p className={styles.category}>{cat}:</p>
            <p className={styles.subcategory}>{subcat}:</p>
            <ul className={styles.targets}>
              {p.subtarget.map(s => (
                <li>{formatSubtargets(s)}</li>
              ))}
            </ul>
          </p>
        );
      }
    }
  }
}

/**
 * Returns categories, subcategories, and targets of a policy record as a
 * series of paragraphs.
 * @param p The policy record
 * @returns The categories, subcategories, and targets of the policy record
 * presented as a series of paragraphs.
 */
function getPolicyCatSubcatTargDeclarative(
  p: PolicyRecord
): ReactElement | null {
  if (p.primary_ph_measure === undefined || p.primary_ph_measure === null)
    return null;
  else {
    const cat: string = p.primary_ph_measure;
    if (p.ph_measure_details === undefined || p.ph_measure_details === null)
      return (
        <p className={styles.text}>
          <p className={styles.category}>
            <span className={styles.label}>Category: </span>
            <span>{cat}</span>
          </p>
        </p>
      );
    else {
      const subcat: string = p.ph_measure_details;
      if (
        p.subtarget === undefined ||
        p.subtarget === null ||
        p.subtarget.length === 0
      )
        return (
          <p className={styles.text}>
            <p className={styles.category}>
              <span className={styles.label}>Category: </span>
              <span>{cat}</span>
            </p>
            <p className={styles.subcategory}>
              <span className={styles.label}>Subcategory: </span>
              <span>{subcat}</span>
            </p>
          </p>
        );
      else {
        return (
          <p className={styles.text}>
            <p className={styles.category}>
              <span className={styles.label}>Category: </span>
              <span>{cat}</span>
            </p>
            <p className={styles.subcategory}>
              <span className={styles.label}>Subcategory: </span>
              <span>{subcat}</span>
            </p>
            <p className={styles.targets}>
              <span className={styles.label}>Targets: </span>
              <span>{formatSubtargets(p.subtarget.join(", "))}</span>
            </p>
          </p>
        );
      }
    }
  }
}

/**
 * Returns a string representation of the policy's category, subcategory,
 * and target(s).
 *
 * @param {PolicyRecord} p The policy
 *
 * @returns {string} A string representation of the policy's category,
 * subcategory, and target(s).
 */
function getPolicyCatSubcatTargSimple(p: PolicyRecord): ReactElement | null {
  if (p.primary_ph_measure === undefined || p.primary_ph_measure === null)
    // no data: show nothing
    return null;
  else {
    const cat: string = p.primary_ph_measure;
    if (p.ph_measure_details === undefined || p.ph_measure_details === null)
      // display category only
      return <p className={styles.text}>{cat}</p>;
    else {
      const subcat: string = p.ph_measure_details;
      if (
        p.subtarget === undefined ||
        p.subtarget === null ||
        p.subtarget.length === 0
      )
        // as above but with subcategory
        return (
          <p className={styles.text}>
            {cat}: {subcat}
          </p>
        );
      else {
        // as above but with list of subtargets
        return (
          <p className={styles.text}>
            <p className={styles.text}>
              {cat}: {subcat}: {formatSubtargets(p.subtarget.join(" ∙ "))}
            </p>
          </p>
        );
      }
    }
  }
}

/**
 * List of place record keys to format for API request filters.
 */
const placeRecordKeys: string[] = ["country_name", "level", "area1", "area2"];

/**
 * Given a set of filters and a place type, formats those filters to ensure
 * the correct data fields are filtered on in the API request.
 * @param filters The original filters
 * @param placeType The place type for which filters should be formatted
 * @returns The formatted filters that account for place type
 */
export function formatFiltersForPlaceType(
  filters: Filters,
  placeType: PlaceType
): Filters {
  if (placeType === "jurisdiction") {
    const formattedFilters: Filters = { ...filters };
    for (const [key, value] of Object.entries(filters)) {
      // adjust keys/values as needed
      if (placeRecordKeys.includes(key)) {
        formattedFilters["auth_entity.place." + key] = value;
        delete formattedFilters[key];
      }
    }
    return formattedFilters;
  } else return filters;
}

/**
 * Returns a function that sets updated ordering using the provided setter only
 * if the ordering has changed.
 *
 * @param setOrdering The setter for column ordering
 * @returns A function that sets updated ordering only if it has changed
 */
export function getOnSort(setOrdering: Function) {
  return () => {
    return (field: string, order: string) => {
      setOrdering((prev: string[][]) => {
        if (prev[0][0] === field && prev[0][1] === order) return prev;
        else return [[field, order]];
      });
    };
  };
}
