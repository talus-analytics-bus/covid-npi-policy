import { MapId } from "components/common/MapboxMap/plugins/mapTypes";
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
