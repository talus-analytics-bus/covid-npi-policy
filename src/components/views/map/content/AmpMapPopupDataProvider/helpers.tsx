import React, { FC } from "react";
import {
  CountryFeature,
  CountyFeature,
  MapFeature,
  MapId,
  MapMetric,
  PolicyResolution,
  StateFeature,
} from "components/common/MapboxMap/plugins/mapTypes";
import { getDataQueryResults } from "components/common/MapboxMap/plugins/dataGetter";
import { Link, LinkProps } from "react-router-dom";
import { ReactElement } from "react-transition-group/node_modules/@types/react";
import { Place } from "components/misc/Queries";
import { PlaceRecord } from "components/misc/dataTypes";
import { InfoTooltip } from "components/common";
import { Moment } from "moment";

export const NO_POLICY_FOR_LOC_MSG: string =
  "No policies currently available for location, data collection in progress";
export const ZERO_POLICY_MSG: string =
  "No policies for location match currently selected options";

type PoliciesLinkProps = {
  tooltip?: string;
  to?: string;
  target?: string;
  disabled?: boolean;
};
export const PoliciesLink: FC<PoliciesLinkProps> = ({
  tooltip,
  to,
  target,
  disabled = false,
  children,
}): ReactElement => {
  if (!disabled && to !== undefined)
    return (
      <Link to={to} target={target}>
        {children}
      </Link>
    );
  else
    return (
      <>
        <span data-disabled={true}>View policies</span>
        {tooltip !== undefined && (
          <InfoTooltip
            {...{
              id: "policyLinkTooltip",
              text: tooltip,
              place: undefined,
            }}
          />
        )}
      </>
    );
};

type GetFeatureMetricProps = {
  feature: CountyFeature | StateFeature | CountryFeature;
  mapMetrics: Array<MapMetric>;
  dataDate: Moment;
  metricId: string;
  map: Record<string, any>;
  paramArgs: Record<string, any>;
};

// TODO abstract filters and policy resolution
export const getFeatureMetric: Function = async ({
  feature,
  mapMetrics,
  dataDate,
  metricId,
  map,
  paramArgs,
}: GetFeatureMetricProps) => {
  if (feature.state[metricId] !== undefined) return feature.state[metricId];
  else {
    // get metric info
    const results: Record<string, any> = await getDataQueryResults({
      date: dataDate,
      metricsToUpdate: mapMetrics.filter(d => d.id === metricId),
      map,
      ...paramArgs,
    });
    const resultDatum: Record<string, any> = results[metricId];
    if (
      resultDatum !== undefined &&
      resultDatum.length > 0 &&
      resultDatum[0].value !== undefined
    )
      return resultDatum[0].value;
  }
  return 9999;
};

export const getFeatureName: Function = (
  feature: CountyFeature | StateFeature | CountryFeature
): string => {
  // counties
  let featureName: string = (feature as CountyFeature).properties.county_name;
  if (featureName !== undefined) {
    return (
      featureName + ", " + (feature as CountyFeature).properties.state_abbrev
    );
  }

  // states
  featureName = (feature as StateFeature).properties.state_name;
  if (featureName !== undefined) return featureName;

  // countries
  featureName = (feature as CountryFeature).properties.NAME;
  if (featureName !== undefined) return featureName;
  else {
    throw "Unknown feature type: " + feature;
  }
};

/**
 * Returns a link to the model page for the feature.
 * @param {CountyFeature | StateFeature | CountryFeature} feature
 * The feature for which the model link is to be determined.
 *
 * @returns {ActionLink}
 * The link component for the model page.
 */
export const getModelLink: Function = (
  feature: CountyFeature | StateFeature | CountryFeature
): ReactElement<LinkProps> | null => {
  // counties
  let featureName: string = (feature as CountyFeature).properties.county_name;
  if (featureName !== undefined) {
    const countyFeature = feature as CountyFeature;
    const url = "/model#" + countyFeature.properties.state_abbrev;
    const text = "View state model";
    return <Link to={url}>{text}</Link>;
  }

  // states
  featureName = (feature as StateFeature).properties.state_name;
  if (featureName !== undefined) {
    const stateFeature = feature as StateFeature;
    const url = "/model#" + stateFeature.properties.state_abbrev;
    const text = "View model";
    return <Link to={url}>{text}</Link>;
  }

  // countries
  featureName = (feature as CountryFeature).properties.NAME;
  if (featureName !== undefined) return null;
  else {
    throw "Unknown feature type: " + feature;
  }
};

/**
 * Returns a link to the policy page or data page for the feature.
 * @param {MapFeature} feature
 * The feature for which the policies or data page link is to be determined.
 * @returns {ActionLink}
 * The link component for the policies or data page.
 */
export const getPoliciesLink: Function = async (
  feature: MapFeature,
  filters: Record<string, any>,
  policyResolution: PolicyResolution
): Promise<ReactElement<LinkProps> | null> => {
  // counties
  let featureName: string = (feature as CountyFeature).properties.county_name;
  if (featureName !== undefined) {
    return await getCountyPoliciesLink(feature as CountyFeature);
  }

  // states
  const countSub: boolean = policyResolution === "subgeo";
  featureName = (feature as StateFeature).properties.state_name;
  if (featureName !== undefined) {
    return await getStatePoliciesLink(
      filters,
      feature as StateFeature,
      countSub
    );
  }

  // countries
  const countryFeature = feature as CountryFeature;
  featureName = countryFeature.properties.NAME;
  if (featureName !== undefined) {
    return await getCountriesPoliciesLink(feature as CountryFeature, countSub);
  } else {
    throw "Unknown feature type: " + feature;
  }

  async function getCountyPoliciesLink(
    countyFeature: CountyFeature,
    toPolicyPage: boolean = true
  ): Promise<ReactElement> {
    if (toPolicyPage) {
      return (
        <PoliciesLink
          target={"_blank"}
          to={"/policies/USA/" + countyFeature.properties.state_name}
        >
          View state policies
        </PoliciesLink>
      );
    } else {
      const countyPlace: PlaceRecord | null = await Place({
        one: true,
        ansiFips: countyFeature.id,
        fields: ["country_name", "area2"],
        level: ["Local"],
        iso3: undefined,
      });

      // if place not found in database, that means no policies, return null
      if (countyPlace === null)
        return <PoliciesLink disabled={true} tooltip={NO_POLICY_FOR_LOC_MSG} />;
      else {
        // otherwise, return the appropriate data page link
        const filterStr: string = JSON.stringify({
          ...filters,
          country_name: [countyPlace.country_name],
          area1: [countyFeature.properties.state_name],
          area2: [countyPlace.area2],
        });
        const url: string = "/data?type=policy&filters_policy=" + filterStr;
        const label: string = "View policies";
        return (
          <PoliciesLink target={"_blank"} to={url}>
            {label}
          </PoliciesLink>
        );
      }
    }
  }
  async function getStatePoliciesLink(
    filters: Record<string, any>,
    stateFeature: StateFeature,
    countSub: boolean,
    toPolicyPage: boolean = true
  ): Promise<ReactElement> {
    if (toPolicyPage) {
      return (
        <PoliciesLink
          target={"_blank"}
          to={"/policies/USA/" + stateFeature.properties.state_name}
        >
          View state policies
        </PoliciesLink>
      );
    } else {
      const filterStr: string = JSON.stringify({
        ...filters,
        country_name: ["United States of America (USA)"],
        area1: [stateFeature.properties.state_name],
        level: !countSub ? ["State / Province"] : ["Local"],
      });
      const url: string = "/data?type=policy&filters_policy=" + filterStr;
      const label: string = "View policies";
      return (
        <PoliciesLink target={"_blank"} to={url}>
          {label}
        </PoliciesLink>
      );
    }
  }

  async function getCountriesPoliciesLink(
    countryFeature: CountryFeature,
    countSub: boolean,
    toPolicyPage: boolean = true
  ): Promise<ReactElement> {
    if (toPolicyPage) {
      return (
        <PoliciesLink
          target={"_blank"}
          to={"/policies/" + countryFeature.properties.ISO_A3}
        >
          View country policies
        </PoliciesLink>
      );
    } else {
      const countryPlace: PlaceRecord | null = await Place({
        one: true,
        ansiFips: undefined,
        iso3: countryFeature.properties.ISO_A3,
        fields: ["country_name"],
        level: !countSub ? ["Country"] : ["State / Province", "Local"],
      });
      if (countryPlace === null)
        return <PoliciesLink tooltip={NO_POLICY_FOR_LOC_MSG} />;
      else {
        const filterStr: string = JSON.stringify({
          ...filters,
          country_name: [countryPlace.country_name],
        });
        const url: string = "/data?type=policy&filters_policy=" + filterStr;
        const label: string = "View policies";
        return (
          <Link target={"_blank"} to={url}>
            {label}
          </Link>
        );
      }
    }
  }
};

export const getDistancingMapMetric: Function = (
  mapId: MapId,
  allMapMetrics: Record<string, Array<MapMetric>>
): MapMetric[] => {
  let key = mapId === "us-county" ? "us" : mapId;
  // get state-level distancing level metric and query params
  const distancingMapMetric = allMapMetrics[key].find(
    d => d.id === "lockdown_level"
  );
  if (distancingMapMetric !== undefined) return [distancingMapMetric];
  else {
    throw "Could not find state-level metric for `lockdown_level`, please " +
      "add it to variable `allMapMetrics` in file `data.js`.";
  }
};

export const getLocationFilters = (
  mapId: string,
  feature: MapFeature
): Record<string, any> => {
  switch (mapId) {
    case "us":
      return getUsStateLocationFilters(feature as StateFeature);
    case "us-county":
      return getUsCountyLocationFilters(feature as CountyFeature);
    case "global":
    default:
      return getCountryLocationFilters(feature as CountryFeature);
  }
  function getUsStateLocationFilters(
    feature: StateFeature
  ): Record<string, any> {
    return {
      iso3: ["USA"],
      area1: [feature.properties.state_name],
    };
  }

  function getUsCountyLocationFilters(
    feature: StateFeature
  ): Record<string, any> {
    return {
      iso3: ["USA"],
      area1: [feature.properties.state_name],
      ansi_fips: [feature.id],
    };
  }

  function getCountryLocationFilters(
    feature: CountryFeature
  ): Record<string, any> {
    return {
      iso3: [feature.properties.ISO_A3],
    };
  }
};
