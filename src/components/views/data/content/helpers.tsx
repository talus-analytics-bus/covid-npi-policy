import {
  DataRecord,
  PlaceRecord,
  PolicyRecord,
} from "components/misc/dataTypes";
import { AuthEntityRecord } from "components/misc/dataTypes";
import React, { ReactElement } from "react";
import { Link } from "react-router-dom";

import styles from "./Helpers.module.scss";

const DEFAULT_POLICY_TITLE: string = "Policy";

export const getLinkedPolicyTitle: Function = (
  p: PolicyRecord
): string | ReactElement => {
  const name = p.policy_name;
  if (name === undefined || name === null) return DEFAULT_POLICY_TITLE;
  else {
    const nameTrimmed: string = name.trim();
    const nameForLink: string =
      nameTrimmed !== "" ? nameTrimmed : DEFAULT_POLICY_TITLE;
    const id = p.id;
    if (id === undefined || id === null) return nameForLink;
    else {
      // get policy URL from place data
      const url: string = getPolicyUrl(p);
      if (url !== null)
        return (
          <Link to={url} title={"Click link to go to policy details page"}>
            {nameForLink}
          </Link>
        );
      else return nameForLink;
    }
  }
};

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

type DataRecordField = keyof DataRecord;
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
 * Returns a list of categories, subcategories, and targets of a policy from
 * its record (API response datum).
 * @param p The policy record
 * @returns {string} List of categories, subcategories, and targets of
 * the policy.
 */
export function getPolicyCatSubcatTarg(
  p: PolicyRecord,
  indented: boolean = false
): ReactElement | null {
  if (indented) return getPolicyCatSubcatTargIndented(p);
  else {
    return getPolicyCatSubcatTargText(p);
  }
}

/**
 * Returns a formatted string of subtargets for presentation in the
 * user interface.
 * @param s The string of subtargets
 * @returns A formatted string of subtargets with spaces padding frontslashes
 * and lowercase
 */
function formatSubtargets(s: string): string {
  return s.replaceAll(" / ", "/").replaceAll("/", " / ");
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
function getPolicyCatSubcatTargText(p: PolicyRecord): ReactElement | null {
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
              <p className={styles.label}>Targets: </p>
              <p>{formatSubtargets(p.subtarget.join(" ∙ "))}</p>
            </p>
          </p>
        );
      }
    }
  }
}
