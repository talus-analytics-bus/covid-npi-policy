import { MapId } from "components/common/MapboxMap/plugins/mapTypes";
import { Moment } from "moment";
import React from "react";
const MapOptionContext = React.createContext<{
  circle?: string | null;
  prevCircle?: string | null;
  setCircle?(newCircle?: string | null): void;
  fill?: string | null;
  setFill?(newFill?: string | null): void;
  mapId?: MapId;
  filters?: Record<string, any>;
  setFilters?(newFilters: Record<string, any>): void;
  date?: Moment;
}>({});
export const MapOptionProvider = MapOptionContext.Provider;
export default MapOptionContext;
