import axios from "axios";
import moment from "moment";
import { isEmpty } from "./Util";

// local utility functions
import ObservationQuery from "./ObservationQuery";

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
 * Get ISO3 codes of countries with distancing levels
 */
export const CountriesWithDistancingLevels = async function() {
  let req;
  req = await axios(`${API_URL}/get/countries_with_lockdown_levels`);
  const res = await req;
  if (res.data !== undefined) return res.data.data;
  else return false;
};

/**
 * Get counts of data instances
 */
export const Count = async function({ class_names }) {
  // prepare params
  const params = new URLSearchParams();
  class_names.forEach(d => {
    params.append("class_names", d);
  });

  let req;
  req = await axios(`${API_URL}/get/count`, {
    params,
  });

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
  entity_class_name = "Policy",
}) {
  let req;
  if (method === "get") {
    const params = new URLSearchParams();
    fields.forEach(d => {
      params.append("fields", d);
    });
    params.append("entity_class_name", entity_class_name);
    req = await axios(`${API_URL}/get/metadata`, {
      params,
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
  page = 1,
  pagesize = 1000000,
  fields = [],
  filters = null,
  by_category = null,
  ordering = [],
  count = false,
}) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  if (by_category !== null) params.append("by_category", by_category);
  params.append("page", page);
  params.append("pagesize", pagesize);
  params.append("count", count);

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/policy`, {
      params,
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/policy`,
      { filters, ordering },
      {
        params,
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

/**
 * Get policy list from API.
 */
export const PolicyList = async function({
  method,
  page = 1,
  pagesize = 1000000,
  fields = [],
  filters = null,
  by_category = null,
  ordering = [],
}) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  if (by_category !== null) params.append("by_category", by_category);
  params.append("page", page);
  params.append("pagesize", pagesize);

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/policy_number`, {
      params,
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }

    const filtersNoUndefined = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value[0] !== undefined) {
        filtersNoUndefined[key] = value;
      }
    });

    console.log({ filters, ordering });
    console.log({ filtersNoUndefined, ordering });
    req = await axios.post(
      `${API_URL}/post/policy_number`,
      { filters: filtersNoUndefined, ordering },
      {
        params,
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

// let allChallenges = null;

/**
 * Get challenge data from API.
 */
export const Challenge = async function({
  method = "get",
  page = 1,
  pagesize = 1000000,
  fields = [],
  filters = {},
  by_category = null,
  ordering = [],
}) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  if (by_category !== null) params.append("by_category", by_category);
  params.append("page", page);
  params.append("pagesize", pagesize);

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/challenge`, {
      params,
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/challenge`,
      { filters, ordering },
      {
        params,
      }
    );
  } else {
    console.log("Error: Method not implemented for `Challenge`: " + method);
    return false;
  }
  const res = await req;
  if (res.data !== undefined) {
    // if (isEmpty(filters)) {
    //   allChallenges = res.data;
    // }
    return res.data;
  } else return false;
};

let allPlans = null;

/**
 * Get Plan data from API.
 */
export const Plan = async function({
  method,
  page = 1,
  pagesize = 1000000,
  fields = [],
  filters = null,
  ordering,
  by_category = null,
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
  params.append("page", page);
  params.append("pagesize", pagesize);
  // TODO implement `by_category` in future if needed
  // if (by_category !== null) params.append("by_category", by_category);

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/plan`, {
      params,
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/plan`,
      { filters, ordering },
      {
        params,
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
  filters = null,
  start_date = null,
  end_date = null,
}) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });

  // if checking lockdown levels then do not include start and end date params
  const includeDates =
    filters["lockdown_level"] === undefined ||
    filters["lockdown_level"][0] !== "lockdown_level";

  const paramsToCheck = [[end_date, "start"]];
  if (includeDates) {
    paramsToCheck.push([start_date, "end"]);
  }
  paramsToCheck.forEach(([v, k]) => {
    if (v !== null) params.append(k, v);
  });

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/policy_status/${geo_res}`, {
      params,
    });
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/policy_status/${geo_res}`,
      { filters },
      {
        params,
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
      params: { class_name },
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
  class_name = null,
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
    params.set("class_name", class_name);

    req = await axios.get(`${API_URL}/get/optionset`, {
      params,
    });
  } else {
    console.log("Error: Method not implemented for `OptionSet`: " + method);
    return false;
  }
  const res = await req;
  if (res.data !== undefined) return res.data.data;
  else return false;
};

/*
 * Get COVID-19 caseload time series for country or for state in USA.
 * NOTE: Either an ID *or* a name for the country / state should be provided
 * but not both for response to behave as expected.
 */
export const Caseload = async ({
  countryId, // place_id for country, e.g., 239
  countryIso3, // name for country, e.g., United States of America
  stateId, // place_id for state, e.g., 264
  stateName, // name for state, e.g., Alabama
  fields = ["date_time", "value"], // fields to return, return all if empty
}) => {
  // determine metric ID based on whether country or state data requested.
  // 74: state-level new COVID-19 cases in last 7 days
  // 77: country-level new COVID-19 cases in last 7 days
  const isState = stateName !== undefined || stateId !== undefined;
  const metric_id = isState ? 74 : 77;

  // define spatial resolution based on same
  const spatial_resolution = isState ? "state" : "country";

  // prepare parameters
  const params = {
    metric_id,
    spatial_resolution,
    temporal_resolution: "daily",
  };

  // get fields to return
  if (fields.length > 0) params.fields = fields;

  // define country place ID based on same
  // TODO get USA place ID dynamically instead of harcoded
  if (countryId !== undefined) params.place_id = countryId;
  if (stateId !== undefined) params.place_id = stateId;
  if (countryIso3 !== undefined) params.place_iso3 = countryIso3;
  if (stateName !== undefined) params.place_name = stateName;

  // send request and return response data
  return await ObservationQuery({ ...params });
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

/*
 * Get COVID-19 caseload time series for country or for state in USA.
 * NOTE: Either an ID *or* a name for the country / state should be provided
 * but not both for response to behave as expected.
 */
export const Caseload = async ({
  countryId, // place_id for country, e.g., 239
  countryIso3, // name for country, e.g., United States of America
  stateId, // place_id for state, e.g., 264
  stateName, // name for state, e.g., Alabama
  fields = ["date_time", "value"], // fields to return, return all if empty
}) => {
  // determine metric ID based on whether country or state data requested.
  // 74: state-level new COVID-19 cases in last 7 days
  // 77: country-level new COVID-19 cases in last 7 days
  const isState = stateName !== undefined || stateId !== undefined;
  const metric_id = isState ? 74 : 77;

  // define spatial resolution based on same
  const spatial_resolution = isState ? "state" : "country";

  // prepare parameters
  const params = {
    metric_id,
    spatial_resolution,
    temporal_resolution: "daily",
  };

  // get fields to return
  if (fields.length > 0) params.fields = fields;

  // define country place ID based on same
  // TODO get USA place ID dynamically instead of harcoded
  if (countryId !== undefined) params.place_id = countryId;
  if (stateId !== undefined) params.place_id = stateId;
  if (countryIso3 !== undefined) params.place_iso3 = countryIso3;
  if (stateName !== undefined) params.place_name = stateName;

  // send request and return response data
  return await ObservationQuery({ ...params });
};
