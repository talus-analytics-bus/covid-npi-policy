import { Filters, MapId } from "components/common/MapboxMap/plugins/mapTypes";

export interface DistancingLevelProps {
  method?: "get" | "post";
  geo_res: "country" | "state";
  iso3?: string;
  state_name?: string;
  date: string;
}

interface PaginatedProps {
  method?: "get" | "post";
  page?: number;
  pagesize?: number;
  fields?: string[];
  filters?: Filters | null;
  ordering?: string[][];
}

interface EpiDataProps {
  countryId: number;
  countryIso3: string;
  ansiFips: string;
  stateId: number;
  stateName: string;
  fields: string[];
}
export interface DeathsProps extends EpiDataProps {
  windowSizeDays?: number;
}
export interface CaseloadProps extends EpiDataProps {
  windowSizeDays?: number;
  isCumulative?: boolean;
  getAverage?: boolean;
}

export interface ExportProps {
  method: "get" | "post";
  filters?: Filters | null;
  class_name?: string | null;
}

export enum GeoRes {
  country = "country",
  state = "state",
  county = "county",
  county_plus_state = "county_plus_state",
}

// export type GeoRes = "country" | "state" | "county" | "county_plus_state";

export interface PolicyStatusCountsProps {
  method?: "get" | "post";
  filters?: Filters | null;
  geo_res: GeoRes;
  fields?: string[];
  count_sub?: boolean;
  include_min_max?: boolean;
  include_zeros?: boolean;
  one?: boolean;
  merge_like_policies?: boolean;
  counted_parent_geos?: GeoRes[];
}

export interface PlanProps extends PolicyProps {}
export interface PolicyProps extends PaginatedProps {
  by_category?: boolean;
  count?: boolean;
  random?: boolean;
  merge_like_policies?: boolean;
}
export interface PolicyListProps extends PaginatedProps {
  by_category?: boolean;
}

export interface MetadataProps {
  method: "get" | "post";
  fields?: string[];
  entity_class_name?: string;
}

export interface OptionSetProps {
  method: "get" | "post";
  fields?: string[] | null;
  class_name?: string | null;
}

export type VersionDataProps = {
  /**
   * The name of the data type.
   */
  name: string;

  /**
   * The date of the most recent datum of the data series.
   */
  last_datum_date: string;

  /**
   * The date on which the data series was last updated.
   */
  date: string;

  /**
   * Last of map types for which the data are applicable.
   */
  map_types: (MapId | "all")[];
};

export type OptionSetDataProps = {
  id: number;
  value: string;
  label: string;
  group?: string;
};

/**
 * Element in array of data series returned by Metrics API
 */
export type MetricDatum = {
  value: string | number | null;
  place_name?: string;
  place_iso?: string;
  place_id?: number;
  fips?: string;
  spatial_resolution?: string;
  temporal_resolution?: string;
};

export interface PlaceProps {
  level: string[];
  one?: boolean;
  ansiFips?: string;
  iso3?: string;
  fields?: string[];
}

export interface MetricAPIRequestProps {
  metric_id: number;
  place_name?: string;
  place_iso?: string;
  place_iso3?: string;
  place_id?: number;
  fips?: string;
  spatial_resolution?: string;
  temporal_resolution?: string;
  fields?: string[] | string;
  start_date?: string;
  end_date?: string;
  start?: string;
  end?: string;
}

export type MetricData = MetricDatum[] & {
  max_all_time?: MetricDatum;
  min_all_time?: MetricDatum;
};
