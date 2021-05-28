import { MapId } from "components/common/MapboxMap/plugins/mapTypes";
import { Moment } from "moment";
import React from "react";
const MapOptionContext = React.createContext<{
  circle?: string | null;
  fill?: string | null;
  mapId?: MapId;
  filters?: Record<string, any>;
  date?: Moment;
}>({});
export const MapOptionProvider = MapOptionContext.Provider;
export default MapOptionContext;
