import axios from "axios";

const API_URL = process.env.REACT_APP_METRICS_API_URL;

interface ObservationReduxProps {
  metric_id: number;
  start_date: string;
  end_date?: string;
  spatial_resolution: "county";
}

/**
 * Get observation data from API. Updates the observation data and loading status
 * when complete.
 */

const ObservationReduxQuery = async function({
  metric_id,
  start_date,
  end_date,
  spatial_resolution,
}: ObservationReduxProps): Promise<any> {
  var params = {
    metric_id,
    spatial_resolution,
    start_date,
  };

  const url = `${API_URL}/observations_redux`;

  const res = await axios({
    url,
    params,
    headers: { "If-Modified-Since": new Date().toUTCString() },
  });

  return res.data.data;
};

export default ObservationReduxQuery;
