/**
 * TypeScript types used by the Map and MapboxMap components.
 */
import {
  GeoRes,
  MetricData,
  OptionSetDataProps,
  VersionDataProps,
} from "api/queryTypes";
import { Numeric } from "d3";
import { ReactNode } from "react-transition-group/node_modules/@types/react";
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

  /**
   * Sets tooltip content.
   * @param tooltipContent The new content for the tooltip
   */
  setInfoTooltipContent(tooltipContent: any): void;
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
export enum MapId {
  us_county_plus_state = "us-county-plus-state",
  us_county = "us-county",
  us = "us",
  global = "global",
}

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

export type MetricShape = "circle" | "circle-state" | "fill";

/**
 * Default settings for a map, such as a map of world countries or of USA
 * states, that will be used to initialize the map.
 */
export type MapDefaultsEntry = {
  /**
   * Default metric to show, or null if none, for each metric shape.
   */
  [K in MetricShape]?: string | null;
} & {
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
   * Mapbox style layer in front of which circle data layers should
   * be inserted.
   *
   * For instance, setting `priorCircleLayer` to `state-points` will cause any fill
   * or circle layers added to this Mapbox map that represent data to be
   * displayed in front of the `state-points` layer, which must exist on the
   * Mapbox style used in this map.
   */
  priorCircleLayer: string;

  /**
   * Mapbox style layer in front of which fill data layers should be inserted.
   *
   * For more information, see definition of `priorCircleLayer`.
   */
  priorFillLayer: string;

  /**
   * List of map layers that should always be hidden.
   */
  hiddenLayers?: string[];

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
export enum PolicyResolution {
  geo,
  subgeo,
}
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

/**
 * Entry defining metadata for a single metric
 */
export type MetricMetaEntry = {
  metric_definition: any;
  metric_displayname: string;
  shortName?: ReactElement;
  value: Function;
  unit: Function;
  trendTimeframe?: ReactElement;
  legendInfo: Record<string, any>;
  valueStyling?: Record<string, ValueStyling>;
  wideDefinition?: boolean;
};

export type ValueStyling = {
  label: string;
  color: string;
  icon?: string;
  def: ReactNode;
  phase?: string;
  noLegendEntry?: boolean;
  bordered?: boolean;
  border?: string;
};

export type MetricMeta = Record<string, MetricMetaEntry>;

export type MapStylesEntry = {
  url: string;
  value: string;
  geo_res: GeoRes;
  name: string;
  defaultFitBounds: number[][];
  tooltip?: string | ReactNode;
  minZoom?: number;
  maxZoom?: number;
  attribution?: boolean;
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
    filter?: any[];
  };
  circleLayers?: MapMetric[]; // TODO assign type
  fillLayers?: MapMetric[]; // TODO assign type
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
  featureLinkField: "place_name" | "place_iso";
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
export type ElementsOrNull =
  | (JSX.Element | null | false)[]
  | JSX.Element
  | null;

/**
 * Filters to provide to API calls for AMP data.
 */
export type Filters = Record<string, string[]> & {
  primary_ph_measure?: string[];
  ph_measure_details?: string[];
};

/**
 * Filter option information derived from optionset API responses
 */
export type FilterDef = {
  field: string;
  entity_name: string;
  label: string;
  radio: boolean;
  defaultRadioValue?: string;
  items: OptionSetDataProps[]; // TODO list of optionsets
  primary?: string;
};

/**
 * Object dictionary of filter definitions
 */
export type FilterDefs = Record<string, FilterDef>;

/**
 * Circle styling parameters for a Mapbox map
 */
export type CircleStyle = (
  key: string,
  linCircleScale: boolean
) => Record<string, any>;

/**
 * Set of circle styling parameters for a Mapbox map indexed by key
 * (i.e., style's unique IDxs)
 */
export type CircleStyles = Record<string, CircleStyle>;

/**
 * Fill styling parameters for a Mapbox map
 */
export type FillStyle = (
  key: string,
  geoHaveData?: string[],
  maxVal?: number,
  minVal?: number
) => Record<string, any>;

/**
 * Set of fill styling parameters for a Mapbox map indexed by key
 * (i.e., style's unique IDxs)
 */
export type FillStyles = Record<string, FillStyle>;

/**
 * Data for display in map
 */
export type MapData = Record<string, MetricData> | null;

/**
 * Fields that may link a geographic feature in a Mapbox source to a
 * Metrics response datum.
 */
export type FeatureLinkFields = "place_name" | "place_iso";

/**
 * Possible types for a feature link field.
 */
export type FeatureLinkValues = string | undefined | null | number;

/**
 * Mapbox viewport properties
 */
export type ViewportProps = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export type MapDataShapeId = string | null | undefined;
