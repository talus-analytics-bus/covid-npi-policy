import { MapId } from "components/common/MapboxMap/plugins/mapTypes";

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
   * Last of map types for which the data are applicable.
   */
  map_types: MapId[];
};
