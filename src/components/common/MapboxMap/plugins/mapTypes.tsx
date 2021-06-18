/**
 * TypeScript types used by the Map and MapboxMap components.
 */
import { VersionDataProps } from "components/misc/queryTypes";
import { Numeric } from "d3";
import { ReactElement } from "react-transition-group/node_modules/@types/react";

/**
 * Props taken by the `Map` component, which renders a Mapbox map.
 */
export type MapProps = {
  /**
   * Whether the map is currently loading or not.
   */
  loading: boolean;

  /**
   * Sets whether the map is currently loading or not.
   * @param {boolean} v True if the map is loading, false otherwise.
   */
  setLoading(v: boolean): void;

  /**
   * Sets the current page of the app to the provided value.
   *
   * Mainly used to style the nav bar based on the current page.
   *
   * @param v The page to which to set the app.
   */
  setPage(v: string): void;

  /**
   * Array of version data describing the last datum dates and last update
   * dates of different data sources used in the app.
   */
  versions: VersionDataProps[];

  /**
   * Additional props used by the Map component.
   *
   * TODO destructure
   */
  props: any;
};

/**
 * A list of allowed map IDs corresponding to the types of maps that have
 * been implemented.
 */
export const validMapIds = [
  "us-county-plus-state",
  "us-county",
  "us",
  "global",
] as const;

/**
 * Allowed map IDs corresponding to the types of maps that have
 * been implemented.
 */
export type MapId = typeof validMapIds[number];

/**
 * Defines a type consisting of each MapId value as a key and a
 * MapDefaultsEntry as an object.
 *
 * This is used exclusively to define `MapDefaults`.
 */
type MapIdEntries = { [K in MapId]: MapDefaultsEntry };

/**
 * Defines general map default options and contains specific map default
 * options indexed by map ID (e.g., 'us', 'global', ...).
 */
export interface MapDefaults extends MapIdEntries {
  /**
   * The ID of the default map to render.
   */
  mapId: MapId;

  /**
   * The minimum and maximum dates that should be toggle-able on the map, for
   * maps that show temporal series.
   */
  minMaxDate: {
    /**
     * The earliest possible date to allow on the map.
     */
    minDate: string;
    /**
     * The latest possible date to allow on the map.
     */
    maxDate: string;
  };
}

/**
 * Default settings for a map, such as a map of world countries or of USA
 * states, that will be used to initialize the map.
 */
export type MapDefaultsEntry = {
  /**
   * Default circle metric to show, or null if none.
   */
  circle: string | null;

  /**
   * True if the default circle metric should be visible by default,
   * false otherwise.
   */
  showCircle?: boolean;

  /**
   * Default fill metric to show, or null if none.
   */
  fill: string | null;

  /**
   * Mapbox style layer in front of which data layers should be inserted.
   *
   * For instance, setting `priorLayer` to `state-points` will cause any fill
   * or circle layers added to this Mapbox map that represent data to be
   * displayed in front of the `state-points` layer, which must exist on the
   * Mapbox style used in this map.
   */
  priorLayer: string;

  /**
   * The initial viewport center point for the map.
   */
  initViewport: {
    /**
     * Latitude of viewport center point.
     */
    latitude: number;
    /**
     * Longitude of viewport center point.
     */
    longitude: number;
    /**
     * Zoom level at viewport center point.
     */
    zoom: number;
  };
};

/**
 * The policy resolution requested or to be displayed, which can be one of two
 * values:
 *
 * "geo" -- policies affecting the geographic resolution displayed on the map
 *
 * "subgeo" -- policies affecting areas within but not equal to the geographic
 * resolution displayed on the map. For example, if a map of world countries is
 * shown, the "subgeo" refers to any policies that affect states, provinces,
 * or localities of the country, but not national-level policies.
 */
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
  metric_definition: any;
  metric_displayname: string;
  shortName?: ReactElement;
  value: Function;
  unit: Function;
  trendTimeframe?: ReactElement;
  legendInfo: Record<string, any>;
  wideDefinition?: boolean;
};

export type MetricMeta = Record<string, MetricMetaEntry>;

export type MapStylesEntry = {
  url: string;
  value: string;
  geo_res: string;
  name: string;
  defaultFitBounds: number[][];
  tooltip?: string;
  minZoom?: number;
  maxZoom?: number;
};

export type MapStyles = Record<MapId, MapStylesEntry>;

export type MapSourcesGeometry = {
  name: string;
  sourceLayer: string;
  def: {
    type: "vector";
    url: string;
    promoteId: string;
    minzoom?: number;
    maxzoom?: number;
    zoomLabel?: string;
  };
};

export type MapSourcesEntry = Record<string, MapSourcesGeometry>;

export type MapSources = Record<MapId, MapSourcesEntry>;

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

export type DistancingLevel =
  | "Lockdown"
  | "Stay at home"
  | "Safer at home"
  | "Partially open"
  | "Open"
  | null;
export type ElementsOrNull = (JSX.Element | null)[] | JSX.Element | null;
