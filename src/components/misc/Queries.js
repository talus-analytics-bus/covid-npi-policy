import axios from "axios";
import moment from "moment";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Get metadata for specified fields
 */
export const Metadata = async function({ method, fields }) {
  let req;
  if (method === "get") {
    const params = new URLSearchParams();
    fields.forEach(d => {
      params.append("fields", d);
    });
    req = await axios(`${API_URL}/get/metadata`, {
      params
    });
  }
  const res = await req;
  if (res.data !== undefined) return res.data;
  else return false;
};

/**
 * Get policy data from API.
 */
export const Policy = async function({
  method,
  fields = [],
  filters = null,
  by_category = null
}) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  if (by_category !== null) params.append("by_category", by_category);

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/policy`, {
      params
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/policy`,
      { filters },
      {
        params
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
 * Get policy status data from API.
 */
export const PolicyStatus = async function({
  method,
  fields = [],
  filters = null
}) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/policy_status/state`, {
      params
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/policy_status/state`,
      { filters },
      {
        params
      }
    );
  } else {
    console.log("Error: Method not implemented for `PolicyStatus`: " + method);
    return false;
  }
  const res = await req;
  if (res.data !== undefined) return res.data.data;
  else return false;
};

/**
 * Get export data from API.
 */
export const Export = async function({ method, filters = null }) {
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/export`);
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }

    req = axios({
      url: `${API_URL}/post/export`,
      method: "POST",
      responseType: "blob",
      data: { filters }
    });

    // TODO comments below
    const res = await req;
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    const dateString = moment().format("YYYY-MM-DD");
    const fn = `COVID AMP - Data Export ${dateString}.xlsx`;
    link.setAttribute("download", fn);
    document.body.appendChild(link);
    link.click();
    return;
  } else {
    console.log("Error: Method not implemented for `Export`: " + method);
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
  // entity_name = null,
  ...params
}) {
  let req;
  if (method === "get") {
    if (fields === null) {
      console.log("Error: `fields` is required for method GET.");
      return false;
    }
    // else if (entity_name === null) {
    //   console.log("Error: `entity_name` is required for method GET.");
    //   return false;
    // }

    // collate fields
    const params = new URLSearchParams();
    fields.forEach(d => {
      params.append("fields", d);
    });
    // params.set("entity_name", entity_name);

    req = await axios.get(`${API_URL}/get/optionset`, {
      params
    });
  } else {
    console.log("Error: Method not implemented for `OptionSet`: " + method);
    return false;
  }
  const res = await req;
  if (res.data !== undefined) return res.data.data;
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
