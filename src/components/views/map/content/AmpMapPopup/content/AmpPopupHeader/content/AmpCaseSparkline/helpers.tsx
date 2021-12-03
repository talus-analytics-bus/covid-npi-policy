import { metricMeta } from "components/common/MapboxMap/plugins/data";
import {
  CaseloadQueryArgs,
  CountryFeature,
  CountyFeature,
  MapFeature,
  MapId,
  StateFeature,
} from "components/common/MapboxMap/plugins/mapTypes";
import { Caseload } from "api/Queries";

export async function updateData(
  mapId: MapId,
  feature: MapFeature,
  setData: Function,
  setReady: Function,
  circle: string | null
) {
  const baseParams: CaseloadQueryArgs = {
    windowSizeDays: 7,
    fields: ["date_time", "value"],
    countryId: undefined,
    countryIso3: undefined,
    stateName: undefined,
    ansiFips: undefined,
    stateId: undefined,
    getAverage: true,
    isCumulative: getIsCumulative(circle),
  };
  setLocationParam(baseParams, mapId, feature);
  const newData = await Caseload(baseParams as any);
  setData(newData);
  setReady(true);
}
function setLocationParam(
  baseParams: CaseloadQueryArgs,
  mapId: string,
  feature: MapFeature
) {
  switch (mapId) {
    case "us":
      baseParams.stateName = (feature as StateFeature).properties.state_name;
      break;
    case "us-county":
    case "us-county-plus-state":
      baseParams.ansiFips = (feature as CountyFeature).id;
      break;
    case "global":
    default:
      baseParams.countryIso3 = (feature as CountryFeature).properties.ISO_A3;
      break;
  }
}

/**
 * Returns true if metric represents a cumulative data series, false otherwise
 * @param metricId ID of metric for which cumulative status is required.
 * @returns True if metric represents a cumulative data series, false otherwise
 */
function getIsCumulative(metricId: string | null): boolean {
  if (metricId === null) return false;
  else {
    const meta: Record<string, any> = getMetricMeta(metricId);
    if (meta === undefined) return false;
    else {
      return meta.metric_displayname.toLowerCase().includes("cumulat");
    }
  }
}

/**
 * Returns the label for the map metric with the given ID.
 * @param metricId The metric ID of the currently displayed metric.
 * @returns The label to be used for the metric.
 */
export function getLabelFromMapMetricId(
  metricId: string | null
): string | null {
  if (metricId === null) return null;
  else {
    const meta: Record<string, any> = getMetricMeta(metricId);
    if (meta !== undefined) return meta.metric_displayname;
    else return null;
  }
}

/**
 * Returns metric metadata for the metric with the defined ID
 * @param metricId The metric ID of for which metadata is required
 * @returns Metric metadata
 */
function getMetricMeta(metricId: string): Record<string, any> {
  return (metricMeta as Record<string, any>)[metricId];
}
