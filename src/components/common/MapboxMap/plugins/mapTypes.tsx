import { Numeric } from "d3";
import { Moment } from "moment";
import { ReactElement } from "react-transition-group/node_modules/@types/react";

export type PolicyResolution = "geo" | "subgeo";
export type FeatureState = Record<string, any>;

export type CountyFeature = {
  id: string;
  state: FeatureState;
  properties: {
    county_name: string;
    state_abbrev: string;
    state_name: string;
    type: string;
  };
};
export type StateFeature = {
  id: string;
  state: FeatureState;
  properties: {
    state_name: string;
    state_abbrev: string;
    type: string;
  };
};
export type CountryFeature = {
  id: string;
  state: FeatureState;
  properties: {
    NAME: string;
    // POSTAL: string;
    // TYPE: string;
    ISO_A3: string;

    // compatibility types
    state_name: undefined;
  };
};

export type MapFeature = CountyFeature | StateFeature | CountryFeature;

export type ObservationQueryParams = {
  metric_id?: string | number;
  func?: Function;
};

export type CaseloadQueryArgs = {
  windowSizeDays: 1 | 7;
  stateName?: string;
  fields?: string[];
  countryId?: number;
  countryIso3?: string;
  ansiFips?: string;
  stateId?: number;
  getAverage?: boolean;
  isCumulative?: boolean;
};

export type Observation = {
  date_time: string;
  value: Numeric | null | undefined | number | string;
};
export type NumericObservation = {
  date_time: string;
  value: Numeric | number | null | undefined;
};

export type MetricMetaEntry = {
  metric_definition: ReactElement;
  metric_displayname: string;
  shortName?: ReactElement;
  value: Function;
  unit: Function;
  trendTimeframe?: ReactElement;
  legendInfo: Record<string, any>;
  wideDefinition?: boolean;
};

export type MetricMeta = Record<string, MetricMetaEntry>;

/**
 * Map metric attributes used to query for metrics.
 */
export type MapMetric = {
  // functions that, when passed `params`, returns the data for the map
  // for this metric
  queryFunc: Function | Record<string, any>;
  // params that must be passed to `queryFunc` as object
  params: ObservationQueryParams;
  for: ("circle" | "fill")[];
  id: string;
  featureLinkField: string;
  styleId: Record<string, string>;
  filter: Array<any>;
  trend: boolean;
  styleOptions: {
    outline: boolean;
    pattern: boolean;
  };
};

export type MapId = "us-county" | "us" | "global";
export type DistancingLevel =
  | "Lockdown"
  | "Stay at home"
  | "Safer at home"
  | "Partially open"
  | "Open"
  | null;
export type ElementsOrNull = (JSX.Element | null)[] | JSX.Element | null;
