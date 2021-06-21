import { MapIdOrAll } from "components/common/MapboxMap/plugins/mapTypes";

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
  map_types: MapIdOrAll[];
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
};

export type MetricData = MetricDatum[] & {
  max_all_time?: MetricDatum;
  min_all_time?: MetricDatum;
};
