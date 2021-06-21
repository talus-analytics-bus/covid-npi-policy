import { MapId } from "components/common/MapboxMap/plugins/mapTypes";
import { Option } from "components/common/OptionControls/types";
import { Moment } from "moment";
import React from "react";
export type MapOptionContextProps = {
  circle?: string | null;
  prevCircle?: string | null;
  setCircle?(newCircle?: string | null): void;
  fill?: string | null;
  setFill?(newFill?: string | null): void;
  mapId?: MapId;
  filters?: Record<string, any>;
  setFilters?(newFilters: Record<string, any>): void;
  date?: Moment;
  categoryOptions?: Option[];
  subcategoryOptions?: Option[];
};

const MapOptionContext = React.createContext<MapOptionContextProps>({});
export const MapOptionProvider = MapOptionContext.Provider;
export default MapOptionContext;
