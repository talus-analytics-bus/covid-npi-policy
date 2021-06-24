import { PlaceRecord, PolicyRecord } from "components/misc/dataTypes";
import { AuthEntityRecord } from "components/misc/dataTypes";
import React, { ReactElement } from "react";
import { Link } from "react-router-dom";

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
