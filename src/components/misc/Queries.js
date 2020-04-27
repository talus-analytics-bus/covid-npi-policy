import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Get metric metadata from API.
 */
export const Policy = async function({ method, filters = null }) {
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/policy`, {
      params: {}
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/policy`,
      { filters },
      {
        params: {}
      }
    );
  } else {
    console.log("Error: Method not implemented for `Policy`: " + method);
    return false;
  }
  const res = await req;
  if (res.data !== undefined) return res.data;
  else return false;
};

export const execute = async function({ queries }) {
  const results = {};
  for (const [k, v] of Object.entries(queries)) {
    const res = await v;
    results[k] = res;
  }
  return results;
};
