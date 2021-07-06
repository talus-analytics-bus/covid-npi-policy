/**
 * Define place data for use in the map, indexed by place code, e.g., FIPS code
 * for counties.
 */
import { createContext } from "react";

export type MapPlaceProps = {
  [k: string]: string;
};

const MapPlaceContext = createContext<MapPlaceProps[]>([{}]);
export default MapPlaceContext;
