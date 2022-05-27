// 3rd party packages
import { ReactElement } from "react";
import { Link, LinkProps } from "react-router-dom";
import { Moment } from "moment";

// types
import {
  CountryFeature,
  CountyFeature,
  Filters,
  MapFeature,
  MapId,
  MapMetric,
  PolicyResolution,
  StateFeature,
} from "components/common/MapboxMap/plugins/mapTypes";
import { PlaceRecord } from "components/misc/dataTypes";
import { Option } from "components/common/OptionControls/types";

// local components and functions
import { getDataQueryResults } from "components/common/MapboxMap/plugins/dataGetter";
import { Place } from "api/Queries";
import { PolicyPageLink } from "./PolicyLink/PolicyPageLink/PolicyPageLink";
import { PolicyDataLink } from "./PolicyLink/PolicyDataLink/PolicyDataLink";
import { includeSubcatFilters } from "../AmpMapPopup/content/PoliciesBodySection/helpers";
import { PolicyLink } from "./PolicyLink/PolicyLink";

// common language
export const NO_POLICY_FOR_LOC_MSG: string =
  "No policies currently available for location, data collection in progress";
export const ZERO_POLICY_MSG: string =
  "No policies for location match currently selected options";
export const DATA_PAGE_LINK_TEXT: string = "View in data page";
const NONE_STATE_MSG: string = "Select subcategories to enable data page link";

// type definitions
export type PolicyLinkBaseProps = {
  tooltip?: string;
  to?: string;
  target?: string;
  disabled?: boolean;
  children?: ReactElement | string;
};
type GetFeatureMetricProps = {
  feature: CountyFeature | StateFeature | CountryFeature;
  mapMetrics: Array<MapMetric>;
  dataDate: Moment;
  metricId: string;
  map: Record<string, any>;
  paramArgs: Record<string, any>;
};

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
  feature: CountyFeature | StateFeature | CountryFeature,
  featureNameByCode?: Record<string, string>
): string => {
  // counties
  let featureName: string = (feature as CountyFeature).properties.county_name;
  if (featureName !== undefined) {
    // define county feature object
    const countyFeature: CountyFeature = feature as CountyFeature;

    // return "state" name for DC (no locality)
    if (countyFeature.properties.state_abbrev === "DC") return featureName;
    else if (featureNameByCode !== undefined) {
      // create name from name data obtained from Metrics database Place table
      return `${featureNameByCode[countyFeature.id]}, ${
        countyFeature.properties.state_name
      }`;
    }

    // if no name data avail., create backup name from feature properties
    else
      return `${featureName}${getCountySuffix(countyFeature)}, ${
        countyFeature.properties.state_name
      }`;
  }

  // states
  featureName = (feature as StateFeature).properties.state_name;
  if (featureName !== undefined) return featureName;

  // countries
  featureName = (feature as CountryFeature).properties.NAME;
  if (featureName !== undefined) return featureName;
  else {
    throw Error("Unknown feature type: " + feature);
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
    const text = "Go to model page";
    return (
      <Link target={"_blank"} to={url}>
        {text}
      </Link>
    );
  }

  // countries
  featureName = (feature as CountryFeature).properties.NAME;
  if (featureName !== undefined) return null;
  else {
    throw Error("Unknown feature type: " + feature);
  }
};

/**
 * Returns a link to the policy page for the feature.
 *
 * @param {MapFeature} feature
 * The feature for which the policies link is to be determined.
 *
 *  @returns {ActionLink}
 * The link component for the policies or data page.
 */
export const getPolicyLink: Function = async (
  feature: MapFeature,
  filters: Filters,
  policyResolution: PolicyResolution,
  page: "policy" | "data",
  mapId: MapId,
  subcatOptions?: Option[]
): Promise<ReactElement<LinkProps> | null> => {
  // constants
  const baseLinkFilters: Filters = { ...filters };
  const isNone: boolean =
    filters.primary_ph_measure !== undefined &&
    filters.primary_ph_measure.length === 1 &&
    filters.primary_ph_measure[0] === "None";

  if (isNone && page === "data")
    return (
      <PolicyLink disabled={true} tooltip={NONE_STATE_MSG}>
        {DATA_PAGE_LINK_TEXT}
      </PolicyLink>
    );

  // streamline base link filters
  if (page === "data" && subcatOptions !== undefined) {
    const includeSubcats: boolean = includeSubcatFilters(
      filters.primary_ph_measure || [],
      filters.ph_measure_details || [],
      subcatOptions
    );
    if (!includeSubcats) baseLinkFilters.ph_measure_details = [];
  }

  // counties
  let featureName: string = (feature as CountyFeature).properties.county_name;
  if (featureName !== undefined) {
    return await getCountyPoliciesLink(feature as CountyFeature);
  }

  // states
  const countSub: boolean = policyResolution === PolicyResolution.subgeo;
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
    return await getCountryPoliciesLink(feature as CountryFeature, countSub);
  } else {
    throw Error("Unknown feature type: " + feature);
  }

  async function getCountyPoliciesLink(
    countyFeature: CountyFeature
  ): Promise<ReactElement> {
    if (page === "policy") {
      return (
        <PolicyPageLink
          target={"_blank"}
          to={"/policies/USA/" + countyFeature.properties.state_name}
        >
          Go to state page
        </PolicyPageLink>
      );
    } else if (page === "data") {
      const countyPlace: PlaceRecord | null = await Place({
        one: true,
        ansiFips: countyFeature.id,
        fields: ["country_name", "area2"],
        level: ["Local", "Local plus state/province"],
        iso3: undefined,
      });

      // if place not found in database, that means no policies, return null
      if (countyPlace === null)
        return (
          <PolicyDataLink disabled={true} tooltip={NO_POLICY_FOR_LOC_MSG} />
        );
      else {
        // otherwise, return the appropriate data page link
        const linkFilters: Filters = {
          ...baseLinkFilters,
          country_name:
            countyPlace.country_name !== undefined
              ? [countyPlace.country_name]
              : [],
          area1: [countyFeature.properties.state_name],
          area2: countyPlace.area2 !== undefined ? [countyPlace.area2] : [],
        };
        if (mapId === "us-county-plus-state")
          linkFilters["level"] = ["Local plus state/province"];
        else if (mapId === "us-county") linkFilters["level"] = ["Local"];
        const filterStr: string = JSON.stringify(linkFilters);
        const url: string = "/data?type=policy&filters_policy=" + filterStr;
        return (
          <PolicyDataLink target={"_blank"} to={url}>
            {DATA_PAGE_LINK_TEXT}
          </PolicyDataLink>
        );
      }
    } else {
      throw Error("Unexpected value for `page`: " + page);
    }
  }
  async function getStatePoliciesLink(
    filters: Filters,
    stateFeature: StateFeature,
    countSub: boolean
  ): Promise<ReactElement> {
    if (page === "policy") {
      return (
        <PolicyPageLink
          target={"_blank"}
          to={"/policies/USA/" + stateFeature.properties.state_name}
        >
          Go to state page
        </PolicyPageLink>
      );
    } else if (page === "data") {
      const filterStr: string = JSON.stringify({
        ...filters,
        country_name: ["United States of America (USA)"],
        area1: [stateFeature.properties.state_name],
        level: !countSub ? ["State / Province"] : ["Local"],
      });
      const url: string = "/data?type=policy&filters_policy=" + filterStr;
      const label: string = DATA_PAGE_LINK_TEXT;
      return (
        <PolicyDataLink target={"_blank"} to={url}>
          {label}
        </PolicyDataLink>
      );
    } else {
      throw Error("Unexpected value for `page`: " + page);
    }
  }

  async function getCountryPoliciesLink(
    countryFeature: CountryFeature,
    countSub: boolean
  ): Promise<ReactElement> {
    if (page === "policy") {
      return (
        <PolicyPageLink
          target={"_blank"}
          to={"/policies/" + countryFeature.properties.ISO_A3 + "/national"}
        >
          Go to country page
        </PolicyPageLink>
      );
    } else if (page === "data") {
      const level: string[] = !countSub
        ? ["Country"]
        : ["State / Province", "Local"];
      const countryPlace: PlaceRecord | null = await Place({
        one: true,
        ansiFips: undefined,
        iso3: countryFeature.properties.ISO_A3,
        fields: ["country_name"],
        level,
      });
      if (countryPlace === null)
        return <PolicyPageLink tooltip={NO_POLICY_FOR_LOC_MSG} />;
      else {
        const filterStr: string = JSON.stringify({
          ...baseLinkFilters,
          country_name: [countryPlace.country_name],
          level,
        });
        const url: string = "/data?type=policy&filters_policy=" + filterStr;
        const label: string = DATA_PAGE_LINK_TEXT;
        return (
          <Link target={"_blank"} to={url}>
            {label}
          </Link>
        );
      }
    } else {
      throw Error("Unexpected value for `page`: " + page);
    }
  }
};

export const getDistancingMapMetric: Function = (
  mapId: MapId,
  allMapMetrics: Record<string, Array<MapMetric>>
): MapMetric[] => {
  const key: string = getDistancingMetricKeyFromMapId(mapId);

  // get state-level distancing level metric and query params
  const distancingMapMetric = allMapMetrics[key].find(
    d => d.id === "lockdown_level"
  );
  if (distancingMapMetric !== undefined) return [distancingMapMetric];
  else {
    throw Error(
      "Could not find state-level metric for `lockdown_level`, please " +
        "add it to variable `allMapMetrics` in file `data.js`."
    );
  }
};

export const getLocationFilters = (
  mapId: string,
  feature: MapFeature
): Filters => {
  switch (mapId) {
    case "us":
      return getUsStateLocationFilters(feature as StateFeature);
    case "us-county":
    case "us-county-plus-state":
      return getUsCountyLocationFilters(feature as CountyFeature);
    case "global":
    default:
      return getCountryLocationFilters(feature as CountryFeature);
  }
  function getUsStateLocationFilters(feature: StateFeature): Filters {
    return {
      iso3: ["USA"],
      area1: [feature.properties.state_name],
    };
  }

  function getUsCountyLocationFilters(feature: StateFeature): Filters {
    return {
      iso3: ["USA"],
      area1: [feature.properties.state_name],
      ansi_fips: [feature.id],
    };
  }

  function getCountryLocationFilters(feature: CountryFeature): Filters {
    return {
      iso3: [feature.properties.ISO_A3],
    };
  }
};

/**
 * Given the ID of the currently displayed map, returns the metric key that
 * should be used for distancing levels on the map. This is necessary because
 * on the county-level map, distancing levels for states should be shown, since
 * they are not calculated for counties.
 * @param mapId The ID of the currently displayed map
 * @returns The metric key that should be used for distancing levels on the map
 */
function getDistancingMetricKeyFromMapId(mapId: MapId): string {
  switch (mapId) {
    case "us-county":
    case "us-county-plus-state":
      return "us";
    default:
      return mapId;
  }
}

/**
 * Given a map feature, returns the map ID that corresponds to its feature
 * type. This map ID is used to guide data requests for the feature's map
 * popup content.
 * @param feature The map feature
 * @returns The map ID that corresponds to the feature type.
 */
export function getMapIdFromFeature(feature: MapFeature, mapId: MapId): MapId {
  if ((feature as CountyFeature).properties.type === "county") {
    if (mapId === MapId.us_county_plus_state) return mapId;
    else return MapId.us_county;
  } else if ((feature as StateFeature).properties.type === "state")
    return MapId.us;
  else if ((feature as CountryFeature).properties.ISO_A3 !== undefined)
    return MapId.global;
  else {
    throw Error("Unexpected feature: " + feature);
  }
}

/**
 * Returns the appropriate suffix for the county feature, e.g., "Parish" for
 * Louisiana, none for DC, or "County" for all others.
 *
 * @param feature The county feature.
 * @returns The appropriate suffix for the county feature.
 */
function getCountySuffix(feature: CountyFeature): string {
  const stateFips: string = feature.properties.state_abbrev;
  if (stateFips === "LA") return " Parish";
  else if (stateFips === "AK") return " Borough";
  else if (stateFips === "DC") return "";
  else return " County";
}
