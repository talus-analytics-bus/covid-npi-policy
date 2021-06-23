import axios from "axios";
import { MetricAPIRequestProps, MetricData } from "./queryTypes";

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
  spatial_resolution = "country",
  place_id,
  place_name,
  place_iso3,
  fields,
  transform,
  fips,
}: MetricAPIRequestProps & { transform?(v: any): void }) {
  end_date = typeof end_date !== "undefined" ? end_date : start_date;

  const params: MetricAPIRequestProps = {
    metric_id: metric_id,
    temporal_resolution: temporal_resolution,
    spatial_resolution: spatial_resolution,
  };

  // Send start and end dates if they are provided, otherwise do not send.
  if (end_date !== undefined) params.start = end_date;
  if (start_date !== undefined) params.end = start_date;
  if (fields !== undefined) params.fields = (fields as string[]).join(",");

  if (place_id !== undefined) {
    params["place_id"] = place_id;
  } else if (place_name !== undefined) {
    params["place_name"] = place_name;
  } else if (place_iso3 !== undefined) {
    params["place_iso3"] = place_iso3;
  } else if (fips !== undefined) params["fips"] = fips;

  const url = `${API_URL}/observations`;

  const res = await axios({
    url,
    params,
    headers: { "If-Modified-Since": new Date().toUTCString() },
  });

  const formattedRes: MetricData = res.data.data;
  if (transform !== undefined) formattedRes.forEach(d => transform(d));
  return formattedRes;
};

export default ObservationQuery;
