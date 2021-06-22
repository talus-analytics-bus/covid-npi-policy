import { metricMeta } from "components/common/MapboxMap/plugins/data";
import {
  FilterDefs,
  MapDataShapeId,
  MapId,
  validMapIds,
} from "components/common/MapboxMap/plugins/mapTypes";
import { getInitLower } from "components/misc/Util";
import { History } from "history";

/**
 * Record in browser history
 */
type BrowserHistoryRecord = {
  /**
   * Path to page
   */
  pathname: string;

  /**
   * URL search parameters
   */
  search: string;
};

/**
 * Replaces the current browser history record with one that represents the
 * map with the defined ID
 * @param {Window} history The window object
 * @param {MapId} mapId The ID of a map
 */
export function replaceMapIdState(
  history: any,
  mapId: MapId,
  title: string = ""
): void {
  if (history !== undefined) {
    const stateObj: BrowserHistoryRecord = getMapHistoryState(mapId);
    const url: string = stateObj.pathname + stateObj.search;
    history.replaceState(stateObj, title, url);
  }
}

/**
 * Given the ID of a map, returns a browser history record that will navigate
 * to it if loaded.
 *
 * @param {MapId} mapId
 * The ID of the currently displayed map
 *
 * @returns {BrowserHistoryRecord}
 * Browser history record that represents the map
 */
export function getMapHistoryState(mapId: string): BrowserHistoryRecord {
  return {
    pathname: "/policymaps",
    search: "?mapId=" + mapId,
  };
}

/**
 * Returns the map ID currently defined as `mapId` in the URL parameters, or
 * null if none is found.
 *
 * Throws an error if an unexpected map ID value is found.
 *
 * @param {MapId | null} defaultMapId
 * Optional default map ID to return if none is defined in the URL search
 * params. Defaults to null.
 *
 * @returns {MapId | null} The map ID defined in the URL search params, or null
 * if none. Throws an error if an unexpected map ID value is found.
 */
export function getParamsMapId(
  defaultMapId: MapId | null = null
): MapId | null {
  const params: Record<string, any> = new URLSearchParams(
    window !== undefined ? window.location.search : ""
  );
  const paramsMapIdTmp: string | null = params.get("mapId");
  const paramsMapId: MapId = (paramsMapIdTmp !== null
    ? paramsMapIdTmp
    : defaultMapId) as MapId;

  // throw error if invalid
  if (paramsMapId !== null && !validMapIds.includes(paramsMapId)) {
    throw Error(
      "Invalid map ID provided as url param, must be one of " +
        validMapIds.join(", ") +
        "; but found: " +
        paramsMapId
    );
  } else return paramsMapId;
}

/**
 * Returns the appropriate dynamic title for the map based on the data
 * shapes currently displayed on it.
 *
 * @param {MapDataShapeId} fill The fill data shape ID
 * @param {MapDataShapeId} circle The circle data shape ID
 * @returns {string} The appropriate dynamic title for the map
 */
export const getMapTitle: Function = (
  fill: MapDataShapeId,
  circle: MapDataShapeId
): string => {
  let title = "";
  const useAltTitles = true;
  if (useAltTitles) {
    title = "COVID-19";
    if (fill === "lockdown_level") {
      title += " distancing levels";
    } else if (fill === "policy_status_counts") {
      title += " mitigation policies";
    }
    if (circle !== null) {
      title += " and cases";
    }
    return title;
  } else {
    if (fill !== undefined && fill !== null) {
      title += metricMeta[fill].metric_displayname;
    }
    if (circle !== null && circle !== undefined) {
      title += ` and ${getInitLower(metricMeta[circle].metric_displayname)}`;
    }
    return title;
    // return title + ` at ${level} level`;
  }
};

export const defaultAmpMapFilters: FilterDefs[] = [
  {
    primary_ph_measure: {
      // data field
      field: "primary_ph_measure",

      // entity
      entity_name: "Policy",

      // display label
      label: "Policy category",

      // true if radio button selection, false if dropdown
      // if radio is true, must also define defaultRadioValue
      radio: true,

      // default value of radio selections
      defaultRadioValue: "Social distancing",

      // placeholder
      items: [],
    },

    // additional filters
    ph_measure_details: {
      field: "ph_measure_details",
      label: "Policy subcategory filter",
      radio: false,
      primary: "primary_ph_measure",
      entity_name: "Policy",
      items: [],
    },
  },
];
