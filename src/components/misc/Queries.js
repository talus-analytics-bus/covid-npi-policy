import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Get policy data from API.
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

/**
 * Get optionset items data from API.
 */
export const OptionSet = async function({
  method,
  fields = null,
  entity_name = null,
  ...params
}) {
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/policy`, {
      params: {}
    });
  } else if (method === "post") {
    if (fields === null) {
      console.log("Error: `fields` is required for method GET.");
      return false;
    } else if (entity_name === null) {
      console.log("Error: `entity_name` is required for method GET.");
      return false;
    }

    // collate fields
    const params = new URLSearchParams();
    fields.forEach(d => {
      params.append("fields", d);
    });
    params.set("entity_name", entity_name);

    req = await axios.get(`${API_URL}/get/optionset`, {
      params
    });
  } else {
    console.log("Error: Method not implemented for `OptionSet`: " + method);
    return false;
  }
  const res = await req;
  if (res.data !== undefined) return res.data;
  else return false;
};

/**
 * Execute set of queries in parallel and return results asynchronously.
 * @method
 * @param  {[type]} queries [description]
 * @return {[type]}         [description]
 */
export const execute = async function({ queries }) {
  const results = {};
  for (const [k, v] of Object.entries(queries)) {
    const res = await v;
    results[k] = res;
  }
  return results;
};
