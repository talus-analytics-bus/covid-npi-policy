import { VersionRecord } from "api/queryTypes";
import {
  MapDataShapeId,
  MapId,
} from "components/common/MapboxMap/plugins/mapTypes";
import { Option } from "components/common/OptionControls/types";
import { Moment } from "moment";
import React, { Dispatch, SetStateAction } from "react";
export type MapOptionContextProps = {
  circle?: string | null;
  prevCircle?: string | null;
  prevFill?: string | null;
  prevDate?: Moment;
  setCircle?: Dispatch<SetStateAction<MapDataShapeId>>;
  setFill?: Dispatch<SetStateAction<MapDataShapeId>>;
  fill?: string | null;
  mapId?: MapId;
  prevMapId?: MapId;
  filters?: Record<string, any>;
  prevFilters?: Record<string, any>;
  setFilters?(newFilters: Record<string, any>): void;
  date?: Moment;
  setDate?: Dispatch<SetStateAction<Moment>>;
  catOptions?: Option[];
  subcatOptions?: Option[];
  versions?: VersionRecord[];
};

const MapOptionContext = React.createContext<MapOptionContextProps>({});
export const MapOptionProvider = MapOptionContext.Provider;
export default MapOptionContext;
