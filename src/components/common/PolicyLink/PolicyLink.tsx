import React from "react";
import { Link } from "react-router-dom";
import styles from "./policylink.module.scss";

/**
 * Define types used by this component.
 */
enum Level {
  Intermediate = "State / Province",
  Country = "Country",
}

type Place = {
  iso3: string;
  area1: string | null;
  level: Level;
};

type PolicyDatum = {
  id: number;
  name_and_desc: string;
  place: Array<Place>;
};

type PolicyLinkProps = {
  aText: string;
  policyDatum: PolicyDatum;
  suffix: string | null;
};

/**
 * JSX for component
 * @param props
 */
export default function PolicyLink(props: PolicyLinkProps) {
  const url = getUrlFromPolicyDatum(props.policyDatum);

  if (url !== null)
    return (
      <span className={styles.policyLink}>
        <Link to={url}>{props.aText}</Link>
        {props.suffix}
      </span>
    );
  else return props.aText;
}

const URL_BASE: string = "/policies";

/**
 * Get URL to policy page from the policy datum provided,
 * e.g., `/policies/USA/California/84002`
 */
const getUrlFromPolicyDatum = (d: PolicyDatum): string | null => {
  const hasMissingData =
    d === undefined ||
    d.id === undefined ||
    d.place[0] === undefined ||
    d.place[0].iso3 === undefined ||
    d.place[0].level === undefined;
  if (hasMissingData) return null;
  else {
    const iso3: string = d.place[0].iso3;

    // TODO with enums
    const isNationalLevel: boolean = d.place[0].level === "Country";

    // get national or province level URL based on place info
    // TODO do with auth entity place instead?
    const hasMissingIntermediateArea =
      !isNationalLevel &&
      (d.place[0].area1 === undefined || d.place[0].area1 === "");
    if (hasMissingIntermediateArea) return null;
    const intermediateAreaParam = isNationalLevel
      ? "/national"
      : `/${d.place[0].area1}`;
    return `${URL_BASE}/${iso3}` + intermediateAreaParam + `/${d.id}`;
  }
};

/**
 * Return name and description of policy/plan for display.
 * @param name
 * @param desc
 */
export function parseNameAndDesc(name: string, desc: string) {
  // if `p_name` tag found, extract name from it, otherwise return null
  const hasName: boolean = name !== undefined;
  if (hasName) {
    if (name.trim() === "Unspecified")
      return {
        name: "[Title unspecified]",
        desc,
      };
    else return { name, desc };
  } else return { name: null, desc };
}
