import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Get metric metadata from API.
 */
export const Policy = async function({ method }) {
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/policy`, {
      params: {}
    });
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
