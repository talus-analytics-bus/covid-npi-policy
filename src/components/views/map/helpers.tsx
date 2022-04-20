/**
 * Helper functions for Map.tsx
 */
import { VersionRecord } from "src/api/queryTypes";
import { defaults, metricMeta } from "src/components/common/MapboxMap/plugins/data";
import {
  FilterDefs,
  Filters,
  MapDataShapeId,
  MapId,
  validMapIds,
} from "src/components/common/MapboxMap/plugins/mapTypes";
import {
  omicronFilters,
  omicronFiltersSubs,
} from "src/components/layout/nav/OmicronDrape/OmicronDrape";
import { getInitLower } from "src/components/misc/Util";
import moment, { Moment } from "moment";

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
 *
 * @param {History} history The window object
 *
 * @param {MapId} mapId The ID of a map
 */
export function replaceMapIdState(
  history: History,
  mapId: MapId,
  title: string = ""
): void {
  if (history !== undefined) {
    const stateObj: BrowserHistoryRecord = getMapHistoryState(mapId);
    const curParams: URLSearchParams = new URLSearchParams(
      window !== undefined ? window.location.search : ""
    );
    curParams.set("mapId", mapId);
    // remove view if set
    curParams.delete("view");
    const url: string = stateObj.pathname + `?${curParams.toString()}`;
    history.replaceState(stateObj, title, url);
  }
}
export function removeViewState(history: History): void {
  if (history !== undefined) {
    const curParams: URLSearchParams = new URLSearchParams(
      window !== undefined ? window.location.search : ""
    );
    curParams.delete("view");
    const url: string = window.location.pathname + `?${curParams.toString()}`;
    history.replaceState(
      { pathname: window.location.pathname, search: url },
      "",
      url
    );
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
  // get map ID from URL parameters
  const params: URLSearchParams = new URLSearchParams(
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

export function getInitFilters({
  view,
}: {
  view: string | null | undefined;
}): Filters {
  if (view === "omicron_travel") {
    return omicronFiltersSubs;
  } else return {};
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
  }
};

/**
 * Definitions for AMP map filters shown in AMP map options panel.
 */
export const ampMapFilterDefs: FilterDefs[] = [
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
    subtarget: {
      field: "subtarget",
      label: "Omicron-related?",
      radio: false,
      entity_name: "Policy",
      items: [],
    },
  },
];

/**
 * Given a list of data series versions, returns the most recent update date
 * for a case count data series for the map with the given ID.
 *
 * @param versions The list of versions for the data series in the map
 * @param mapId The ID of the map of interest
 * @returns {Moment} The Moment object for the most recent date a data series
 * in `versions` was last updated.
 */
export function getCaseDataUpdateDate(
  versions: VersionRecord[],
  mapId: MapId
): Moment {
  const casesUpdatedDatum: VersionRecord | undefined = versions.find(
    d => d.name.includes("COVID-19") && d.map_types.includes(mapId)
  );
  const casesUpdatedMoment: Moment = casesUpdatedDatum
    ? moment(casesUpdatedDatum.last_datum_date)
    : moment();
  // defaults.minMaxDate.maxDate = casesUpdatedMoment.format("YYYY-MM-DD");
  return casesUpdatedMoment;
}

/**
 * Given a list of data series versions, returns the most recent update date
 * for any data series for the map with the given ID.
 *
 * @param versions The list of versions for the data series in the map
 * @param mapId The ID of the map of interest
 * @returns {Moment} The Moment object for the most recent date a data series
 * in `versions` was last updated.
 */
export function getOverallUpdateDate(
  versions: VersionRecord[],
  mapId: MapId
): Moment {
  const applicableVersions: VersionRecord[] = versions.filter(d => {
    return d.map_types.includes("all") || d.map_types.includes(mapId);
  });
  const lastUpdatedDateOverall: Moment = moment(applicableVersions[0].date);
  return lastUpdatedDateOverall;
}
