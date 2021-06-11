import TrendQuery from "../../../misc/TrendQuery.js";
import { execute } from "../../../misc/Queries";
import { parseStringSafe } from "../../../misc/UtilsTyped";
import { allMapMetrics as _mapMetrics } from "./data";
import { Moment } from "moment";

// types
import { MapMetric } from "./mapTypes";

type DataGetterArgs = {
  data: Record<string, any>;
  mapId: string;
  prevMapId: string;
  filters: Record<string, any>;
  policyResolution: string;
  map: Record<string, any>;
  date: Moment;
  circle: number | string | null;
  fill: number | string | null;
  prevDate: Moment;
  prevCircle: number | string | null;
  prevFill: number | string | null;
  prevFilters: Record<string, any>;
};

/**
 * dataGetter
 * Given the date, map ID, and filters, obtains the data that should be joined
 * to the features on the map
 * @method dataGetter
 */

export const dataGetter = async ({
  data,
  mapId,
  prevMapId,
  filters,
  policyResolution,
  map,
  date,
  circle,
  fill,
  prevDate,
  prevCircle,
  prevFill,
  prevFilters,
}: DataGetterArgs) => {
  // get all metrics displayed in the current map
  const mapMetrics: Record<string, any> = _mapMetrics;

  const [metricsToUpdate, metricsToReuse] = getMetricsToUpdateOrReuse(
    data,
    mapMetrics[mapId],
    mapId,
    circle,
    fill,
    date,
    filters,
    prevCircle,
    prevFill,
    prevDate,
    prevFilters,
    prevMapId
  );
  // define date parameters for API calls
  const results: Record<string, any> = await getDataQueryResults({
    date,
    filters,
    metricsToUpdate,
    mapId,
    policyResolution,
    map,
  });
  const reusedData: Record<string, any> = {};
  metricsToReuse.forEach(d => {
    reusedData[d.id] = data[d.id];
    const trendKey = d.id + "-trend";
    const trend = data[trendKey];
    if (trend !== undefined) reusedData[trendKey] = trend;
  });
  return { ...reusedData, ...results };
};

const getMetricsToUpdateOrReuse = (
  data: Record<string, any>,
  metrics: Array<MapMetric>,
  mapId: string,
  circle: number | string | null,
  fill: number | string | null,
  date: Moment,
  filters: Record<string, any>,
  prevCircle: number | string | null,
  prevFill: number | string | null,
  prevDate: Moment,
  prevFilters: Record<string, any>,
  prevMapId: string
): Array<Array<MapMetric>> => {
  // convert circle and fill IDs to strings for comparison with metric info
  const circleStr = parseStringSafe(circle);
  const fillStr = parseStringSafe(fill);

  // if date is different, or if circle and fill are different, update all,
  // reuse none
  const diffDate = date !== prevDate;
  const diffFilters = JSON.stringify(filters) !== JSON.stringify(prevFilters);
  const diffCircle = circle !== prevCircle;
  const diffFill = fill !== prevFill;
  const diffMapId = mapId !== prevMapId;
  const allSame = !diffDate && !diffCircle && !diffFill && !diffFilters;
  const updateAll =
    data === null ||
    diffMapId ||
    diffDate ||
    (diffCircle && diffFill) ||
    allSame;

  const toUpdate: Array<MapMetric> = [];
  const toReuse: Array<MapMetric> = [];
  const getIsVisibleMetric = (d: MapMetric): boolean =>
    d.id === circleStr || d.id === fillStr;
  const visibleMetrics: Array<MapMetric> = metrics.filter(getIsVisibleMetric);
  if (updateAll) {
    return [visibleMetrics, []];
    // else if circle is different, update circle, reuse fill
  } else if (diffCircle) {
    visibleMetrics.forEach((d: MapMetric) => {
      if (d.for.includes("circle") && d.id === circleStr) {
        toUpdate.push(d);
      } else toReuse.push(d);
    });
    // else if fill is different, update fill, reuse circle
  } else if (diffFill || diffFilters) {
    visibleMetrics.forEach(d => {
      if (d.for.includes("fill") && d.id === fillStr) {
        toUpdate.push(d);
      } else toReuse.push(d);
    });
    // else reuse all
  } else {
    return [[], visibleMetrics];
  }

  return [toUpdate, toReuse];
};

type GetDataQueryResultsProps = {
  date: Moment;
  metricsToUpdate: MapMetric[];
  map: Record<string, any>;
  filters?: Record<string, any>;
  mapId?: string;
  policyResolution?: string;
  stateName?: string;
  iso3?: string;
};

export async function getDataQueryResults({
  date,
  filters,
  metricsToUpdate,
  mapId,
  policyResolution,
  map,
  stateName,
  iso3,
}: GetDataQueryResultsProps) {
  const dateStr = date.format("YYYY-MM-DD");
  const dates = {
    start_date: dateStr,
    end_date: dateStr,
  };

  // add dates to filters
  const filtersWithDates: Record<string, any> = { ...filters };
  filtersWithDates.dates_in_effect = [dateStr, dateStr];

  // collate query definitions based on the metrics that are to be displayed
  // for this map and whether those metrics will have trends displayed or not
  const queryDefs: Record<string, any> = {};
  metricsToUpdate.forEach((d: MapMetric) => {
    // if the query for this metric hasn't been defined yet, define it
    if (queryDefs[d.id] === undefined) {
      // parse query params
      const params =
        d.params.func !== undefined
          ? d.params.func({
              date,
              mapId,
              filters: filtersWithDates,
              policyResolution,
              map,
              state_name: stateName,
              iso3,
            })
          : { ...d.params, mapId };
      // add base data query
      queryDefs[d.id] = {
        queryFunc: d.queryFunc,
        ...params,
        ...dates,
      };

      // add trend query if applicable
      if (d.trend === true && d.params.metric_id !== undefined) {
        const trendKey = d.params.metric_id.toString() + "-trend";
        queryDefs[trendKey] = {
          queryFunc: TrendQuery,
          ...d.params,
          end: dates.end_date,
        };
      }
    }
  });

  // collate queries in object to be called by the `execute method below`
  const queries: Record<string, Promise<Record<string, any>>> = {};
  for (const [k, v] of Object.entries(queryDefs)) {
    queries[k] = v.queryFunc({
      ...v,
    });
  }

  // execute queries in parallel
  const executeParams: any = { queries };
  const results: Record<string, any> = await execute(executeParams);
  return results;
}
