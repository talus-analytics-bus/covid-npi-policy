import axios from "axios";

const API_URL = process.env.REACT_APP_METRICS_API_URL;

/**
 * Get observation data from API. Updates the observation data and loading status
 * when complete.
 * @method getObservations
 */

const TrendQuery = async function({ metric_id, end, lag = 1, place = "all" }) {
  place = typeof place !== "undefined" ? place : "all";

  var params = {
    metric_id: metric_id,
    end: end,
    lag: lag,
  };

  if (place !== "all") {
    params["place_id"] = place;
  }

  const res = await axios(`${API_URL}/trend`, {
    params,
  });

  return res.data.data;
};

export default TrendQuery;
