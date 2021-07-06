import axios from "axios";

const API_URL = process.env.REACT_APP_METRICS_API_URL;

/**
 * Get place data from API.
 */
const cache = {};
const PlaceQuery = async function({
  place_id = [],
  by_region = false,
  place_type = [],
}) {
  // if all places previously cached, return cache
  const cacheKey =
    place_type.sort().join(",") +
    place_id.sort().join(",") +
    by_region.toString();
  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
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
    if (cache[cacheKey] === undefined) {
      cache[cacheKey] = res.data.data;
    }
    return res.data.data;
  }
};

export default PlaceQuery;
