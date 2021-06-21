import {
  MapId,
  validMapIds,
} from "components/common/MapboxMap/plugins/mapTypes";
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
 * @param {History} history The browser History API instance
 * @param {MapId} mapId The ID of a map
 */
export function replaceMapIdState(history: History, mapId: MapId): void {
  history.replace(getMapHistoryState(mapId));
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
