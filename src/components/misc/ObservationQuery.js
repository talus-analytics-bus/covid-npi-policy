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
  fields,
}) {
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
  } else if (place_id !== undefined) {
    params["place_id"] = place_id;
  } else if (place_name !== undefined) {
    params["place_name"] = place_name;
  }

  const res = await axios(`${API_URL}/observations`, {
    params,
  });

  return res.data.data;
};

export default ObservationQuery;
