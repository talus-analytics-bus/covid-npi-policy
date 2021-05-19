import TrendQuery from "../../../misc/TrendQuery.js";
import { execute } from "../../../misc/Queries";
import { parseStringSafe } from "../../../misc/UtilsTyped";
import { mapMetrics } from "./data";

/**
 * dataGetter
 * Given the date, map ID, and filters, obtains the data that should be joined
 * to the features on the map
 * @method dataGetter
 * @param  {[type]}   date    [description]
 * @param  {[type]}   mapId   [description]
 * @param  {[type]}   filters [description]
 * @param  {[type]}   map     [description]
 * @return {Promise}          [description]
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
}) => {
  // get all metrics displayed in the current map
  const [metricsToUpdate, metricsToReuse] = getUpdateMetrics(
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
  const dateStr = date.format("YYYY-MM-DD");
  const dates = {
    start_date: dateStr,
    end_date: dateStr,
  };

  // add dates to filters
  const filtersWithDates = { ...filters };
  filtersWithDates.dates_in_effect = [dateStr, dateStr];

  // collate query definitions based on the metrics that are to be displayed
  // for this map and whether those metrics will have trends displayed or not
  const queryDefs = {};
  metricsToUpdate.forEach(d => {
    // if the query for this metric hasn't been defined yet, define it
    if (queryDefs[d.id] === undefined) {
      // parse query params
      const params =
        typeof d.params === "function"
          ? d.params({
              date,
              mapId,
              filters: filtersWithDates,
              policyResolution,
              map,
            })
          : d.params;

      // add base data query
      queryDefs[d.id] = {
        queryFunc: d.queryFunc,
        ...params,
        ...dates,
      };

      // add trend query if applicable
      if (d.trend === true) {
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
  const queries = {};
  for (const [k, v] of Object.entries(queryDefs)) {
    queries[k] = v.queryFunc({
      ...v,
    });
  }

  // execute queries in parallel
  const results = await execute({ queries });
  const reusedData = {};
  metricsToReuse.forEach(d => {
    reusedData[d.id] = data[d.id];
    const trendKey = d.id + "-trend";
    const trend = data[trendKey];
    if (trend !== undefined) reusedData[trendKey] = trend;
  });
  return { ...reusedData, ...results };
};

const getUpdateMetrics = (
  data,
  metrics,
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
) => {
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

  const toUpdate = [];
  const toReuse = [];
  const getIsVisibleMetric = d => d.id === circleStr || d.id === fillStr;
  const visibleMetrics = metrics.filter(getIsVisibleMetric);
  if (updateAll) {
    return [visibleMetrics, []];
    // else if circle is different, update circle, reuse fill
  } else if (diffCircle) {
    visibleMetrics.forEach(d => {
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

  return [toUpdate, toReuse]; // TODO
};
