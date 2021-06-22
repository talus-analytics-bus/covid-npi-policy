import axios from "axios";
import Util from "../components/misc/Util.js";

const API_URL = process.env.REACT_APP_METRICS_API_URL;

/**
 * Get place data from API.
 */
let cache;
const PlaceQuery = async function({
  place_id = [],
  by_region = false,
  place_type = [],
}) {
  // if all places were requested and response was previously cached, return it
  const gotAllPlaces = place_id.length === 0;
  if (gotAllPlaces && cache !== undefined) {
    return cache;
  } else {
    const params = new URLSearchParams();
    params.append("by_region", by_region);
    place_type.forEach(d => {
      params.append("place_type", d);
    });
    place_id.forEach(d => {
      params.append("place_id", d);
    });

    const res = await axios(`${API_URL}/places`, {
      params,
    });

    // if all places were retrieved then store this most common request in a
    // cache variable
    if (gotAllPlaces) {
      cache = res.data.data;
    }
    return res.data.data;
  }
};

export default PlaceQuery;
