import axios from "axios";
import moment from "moment";
import { isEmpty } from "./Util";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Get glossary terms
 */
export const Glossary = async function({ field }) {
  let req;
  req = await axios(`${API_URL}/get/glossary`);
  const params = new URLSearchParams();
  params.append("field", field);
  const res = await req;
  if (res.data !== undefined) return res.data.data;
  else return false;
};

/**
 * Get versions of data used
 */
export const Version = async function() {
  let req;
  req = await axios(`${API_URL}/get/version`);
  const res = await req;
  if (res.data !== undefined) return res.data.data;
  else return false;
};

/**
 * Get metadata for specified fields
 */
export const Metadata = async function({
  method,
  fields,
  entity_class_name = "Policy"
}) {
  let req;
  if (method === "get") {
    const params = new URLSearchParams();
    fields.forEach(d => {
      params.append("fields", d);
    });
    params.append("entity_class_name", entity_class_name);
    req = await axios(`${API_URL}/get/metadata`, {
      params
    });
  }
  const res = await req;
  if (res.data !== undefined) return res.data;
  else return false;
};

let allPolicies = null;

/**
 * Get policy data from API.
 */
export const Policy = async function({
  method,
  fields = [],
  filters = null,
  by_category = null
}) {
  // return cached result if available
  if (isEmpty(filters) && allPolicies !== null) {
    // console.log("\n\ndoing it");
    return allPolicies;
  }

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
  if (res.data !== undefined) {
    if (isEmpty(filters)) {
      allPolicies = res.data;
    }
    return res.data;
  } else return false;
};

let allPlans = null;

/**
 * Get Plan data from API.
 */
export const Plan = async function({
  method,
  fields = [],
  filters = null,
  by_category = null
}) {
  // return cached result if available
  if (isEmpty(filters) && allPlans !== null) {
    return allPlans;
  }

  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  // TODO implement `by_category` in future if needed
  // if (by_category !== null) params.append("by_category", by_category);

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/plan`, {
      params
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/plan`,
      { filters },
      {
        params
      }
    );
  } else {
    console.log("Error: Method not implemented for `Plan`: " + method);
    return false;
  }
  const res = await req;
  if (res.data !== undefined) {
    if (isEmpty(filters)) {
      allPlans = res.data;
    }
    return res.data;
  } else return false;
};

/**
 * Get policy status data from API.
 */
export const PolicyStatus = async function({
  method,
  geo_res = "state",
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
    req = await axios(`${API_URL}/get/policy_status/${geo_res}`, {
      params
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/policy_status/${geo_res}`,
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
export const Export = async function({ method, filters = null, class_name }) {
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
      data: { filters },
      params: { class_name }
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
