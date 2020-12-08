import axios from "axios";
import Util from "./Util.js";

const API_URL = process.env.REACT_APP_METRICS_API_URL;

/**
 * Get observation data from API. Updates the observation data and loading status
 * when complete.
 * @method getObservations
 */

const ObservationQuery = async function({
  metric_id,
  temporal_resolution,
  start_date,
  end_date,
  country,
  spatial_resolution = "country",
  place_id,
  place_name,
  place_iso3,
  fields,
}) {
  // if (metric_id === -9999) {
  //   // DEBUG DATA
  //   const debugRandomValues = [];
  //   let n = 1;
  //   while (n < 51) {
  //     debugRandomValues.push({
  //       id: n,
  //       value: Math.random() * 100
  //     });
  //     n++;
  //     // const test = {
  //     //   data_source: "Notional data",
  //     //   date_time: "2020-01-01 00:00:00 +00",
  //     //   definition:
  //     //   "N/A",
  //     //   metric: "test_metric",
  //     //   observation_id: 123594,
  //     //   place_fips: null,
  //     //   place_id: 7,
  //     //   place_iso: "AD",
  //     //   place_name: "Andorra",
  //     //   stale_flag: true,
  //     //   updated_at: "Tue, 18 Feb 2020 00:00:00 GMT",
  //     //   value: 0
  //     // };
  //   }
  //   return debugRandomValues;
  // }
  end_date = typeof end_date !== "undefined" ? end_date : start_date;

  country = typeof country !== "undefined" ? country : "all";

  var params = {
    metric_id: metric_id,
    temporal_resolution: temporal_resolution,    
    spatial_resolution: spatial_resolution,
  };

  // Send start and end dates if they are provided, otherwise do not send.
  if (end_date !== undefined) params.start = end_date;
  if (start_date !== undefined) params.end = start_date;
  if (fields !== undefined) params.fields = fields.join(",");

  if (country !== "all") {
    params["place_id"] = country;
  }
  if (place_id !== undefined) {
    params["place_id"] = place_id;
  } else if (place_name !== undefined) {
    params["place_name"] = place_name;
  } else if (place_iso3 !== undefined) {
    params["place_iso3"] = place_iso3;
  }

  const res = await axios(`${API_URL}/observations`, {
    params
  });

  return res.data.data;
};

export default ObservationQuery;
