import TrendQuery from "../../../misc/TrendQuery.js";
import { execute } from "../../../misc/Queries";
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
  date,
  mapId,
  filters,
  policyResolution,
  map,
}) => {
  // get all metrics displayed in the current map
  const metrics = mapMetrics[mapId];

  // define date parameters for API calls
  const dates = {
    start_date: date,
    end_date: date,
  };

  // collate query definitions based on the metrics that are to be displayed
  // for this map and whether those metrics will have trends displayed or not
  const queryDefs = {};
  metrics.forEach(d => {
    // if the query for this metric hasn't been defined yet, define it
    if (queryDefs[d.id] === undefined) {
      // parse query params
      const params =
        typeof d.params === "function"
          ? d.params({ date, mapId, filters, policyResolution, map })
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

  // return results
  return results;
};
