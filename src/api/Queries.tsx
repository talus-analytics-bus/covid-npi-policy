import axios, { AxiosResponse } from "axios";
import moment from "moment";
import { isEmpty } from "components/misc/UtilsTyped";

// local utility functions
import ObservationQuery from "./ObservationQuery";
import {
  CaseloadProps,
  DeathsProps,
  DistancingLevelProps,
  ExportProps,
  GeoRes,
  MetadataQueryArgs,
  ObservationQueryArgs,
  MetricRecords,
  OptionSetQueryArgs,
  PlaceQueryProps,
  PlanProps,
  PolicyListProps,
  PolicyProps,
  PolicyStatusCountsProps,
  PolicyStatusCountsForMapProps,
} from "./queryTypes";
import { Filters } from "components/common/MapboxMap/plugins/mapTypes";

const API_URL = process.env.REACT_APP_API_URL;

interface GetMetricIdProps {
  isState: boolean;
  windowSizeDays: number;
  isCounty?: boolean;
  isCumulative?: boolean;
}

/**
 * Get glossary terms
 */
export const Glossary = async function({
  field,
}: {
  field: string;
}): Promise<MetricRecords | boolean> {
  let req: AxiosResponse<Record<string, any>> = await axios(
    `${API_URL}/get/glossary`
  );
  const params: URLSearchParams = new URLSearchParams();
  params.append("field", field);
  const res: Record<string, any> = await req;
  if (res.data !== undefined) return res.data.data as MetricRecords;
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
export const Count = async function({
  class_names,
}: {
  class_names: string[];
}) {
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
  fields = [],
  entity_class_name = "Policy",
}: MetadataQueryArgs) {
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
  if (res !== undefined && res.data !== undefined) return res.data;
  else return false;
};

let allPolicies = null;

/**
 * Get policy data from API.
 */
export const Policy = async function({
  method = "get",
  page = 1,
  pagesize = 1000000,
  fields = [],
  filters = null,
  by_category = false,
  ordering = [],
  count = false,
  random = false,
  merge_like_policies = true,
}: PolicyProps) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  if (by_category !== null)
    params.append("by_category", by_category.toString());
  params.append("page", page.toString());
  params.append("pagesize", pagesize.toString());
  params.append("count", count.toString());
  params.append("random", random.toString());
  params.append("merge_like_policies", merge_like_policies.toString());

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
  by_category = false,
  ordering = [],
}: PolicyListProps) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  if (by_category !== null)
    params.append("by_category", by_category.toString());
  params.append("page", page.toString());
  params.append("pagesize", pagesize.toString());

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

    const filtersNoUndefined: Filters = {};

    if (filters !== null)
      Object.entries(filters).forEach(([key, value]) => {
        if (value[0] !== undefined) {
          filtersNoUndefined[key] = value;
        }
      });

    // console.log({ filters, ordering });
    // console.log({ filtersNoUndefined, ordering });
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
      // eslint-disable-next-line
      allPolicies = res.data; // TODO ensure local caching works
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
  by_category = false,
  ordering = [],
}) {
  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  if (by_category !== null)
    params.append("by_category", by_category.toString());
  params.append("page", page.toString());
  params.append("pagesize", pagesize.toString());

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

let allPlans: MetricRecords | null = null;

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
}: PlanProps) {
  // return cached result if available
  if (isEmpty(filters) && allPlans !== null) {
    return allPlans;
  }

  // prepare params
  const params = new URLSearchParams();
  fields.forEach(d => {
    params.append("fields", d);
  });
  params.append("page", page.toString());
  params.append("pagesize", pagesize.toString());
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
 * Get distancing level data from API.
 */
export const DistancingLevel = async function({
  method = "get",
  geo_res,
  iso3,
  state_name,
  date,
}: DistancingLevelProps) {
  // prepare params
  const params = new URLSearchParams();
  const toAdd: [string, any][] = [
    ["geo_res", geo_res],
    ["iso3", iso3],
    ["state_name", state_name],
    ["date", date],
    ["all_dates", false],
    ["deltas_only", false],
  ];
  addParams(toAdd, params);

  // prepare request
  let req;
  if (method === "get") {
    req = await axios(`${API_URL}/get/distancing_levels`, {
      params,
    });
  } else {
    console.error(
      "Error: Method not implemented for `DistancingLevel`: " + method
    );
    return false;
  }
  const res = await req;
  if (res.data !== undefined) return res.data.data;
  else return false;
};

/**
 * Get policy status counts data from API specifically for Map page use.
 */
export const PolicyStatusCountsForMap = async function({
  geo_res,
  mapFilters = {},
  date,
}: PolicyStatusCountsForMapProps) {
  if (date === undefined) throw Error("Must define `date`");

  // prepare params
  const params = new URLSearchParams();

  // translate keys
  const keyToParamName: Record<string, string> = {
    cats: "categories",
    subcats: "subcategories",
  };

  // append list-like param values
  for (const [keyTmp, vals] of Object.entries(mapFilters)) {
    if (vals === undefined) continue;

    const key = keyToParamName[keyTmp] ?? keyTmp;
    if (typeof vals !== "object") params.append(key, vals.toString());
    else
      vals.forEach(val => {
        if (val === undefined) return;
        params.append(key, val.toString());
      });
  }
  params.append("date", date);

  // prepare request
  const req = await axios.get(
    `${API_URL}/get/policy_status_counts_for_map/${geo_res}`,
    {
      params,
    }
  );
  const res = await req;
  if (res !== undefined)
    if (res.data !== undefined) {
      const formattedRes = res.data.data;
      formattedRes.min_all_time = res.data.min_all_time;
      formattedRes.max_all_time = res.data.max_all_time;
      return formattedRes;
    } else return false;
  else return false;
};

/**
 * Get policy status counts data from API.
 */
export const PolicyStatusCounts = async function({
  method,
  geo_res = GeoRes.state,
  fields = [],
  filters = null,
  count_sub = false,
  include_min_max = false,
  include_zeros = true,
  one = false,
  merge_like_policies = true,
  counted_parent_geos = [],
}: PolicyStatusCountsProps) {
  // prepare params
  const params = new URLSearchParams();

  // // if mapId is defined, set counted_parent_geos accordingly
  // if (mapId !== undefined && counted_parent_geos.length === 0) {
  //   if (mapId === "us-county-plus-state") counted_parent_geos.push("state");
  // }

  // append list-like param values
  fields.forEach(d => {
    params.append("fields", d);
  });
  counted_parent_geos.forEach(d => {
    params.append("counted_parent_geos", GeoRes[d]);
  });

  params.append("count_sub", count_sub.toString());
  params.append("include_min_max", include_min_max.toString());
  params.append("one", one.toString());
  params.append("merge_like_policies", merge_like_policies.toString());
  params.append("include_zeros", include_zeros.toString());

  // prepare request
  let req;
  if (method === "get") {
    console.error("GET not yet implemented for PolicyStatusCounts");
  } else if (method === "post") {
    if (filters === null) {
      console.log("Error: `filters` is required for method POST.");
    }
    req = await axios.post(
      `${API_URL}/post/policy_status_counts/${geo_res}`,
      { filters },
      {
        params,
      }
    );
  } else {
    console.error(
      "Error: Method not implemented for `PolicyStatusCounts`: " + method
    );
    return false;
  }
  const res = await req;
  if (res !== undefined)
    if (res.data !== undefined) {
      const formattedRes = res.data.data;
      formattedRes.min_all_time = res.data.min_all_time;
      formattedRes.max_all_time = res.data.max_all_time;
      return formattedRes;
    } else return false;
  else return false;
};

/**
 * Get export data from API.
 */
export const Export = async function({
  method,
  filters = null,
  class_name,
}: ExportProps) {
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
    const fn = `COVID AMP - Data Export${
      class_name?.includes("Summary") ? " (summary)" : ""
    } ${dateString}.xlsx`;
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
export const OptionSet = async ({
  method,
  optimized = false,
  fields = null,
  class_name = null,
}: OptionSetQueryArgs): Promise<any> => {
  let req;
  if (method === "get") {
    if (!optimized && fields === null) {
      console.log("Error: `fields` is required for method GET.");
      return false;
    }

    // collate fields
    const params = new URLSearchParams();
    if (fields !== null)
      fields.forEach(d => {
        params.append("fields", d);
      });
    params.set("class_name", class_name || "Policy");
    const route: string = optimized ? "optionset_for_data" : "optionset";
    req = await axios.get(`${API_URL}/get/${route}`, {
      params,
    });
  } else {
    console.log("Error: Method not implemented for `OptionSet`: " + method);
    return false;
  }
  const res = await req;
  if (res.data !== undefined) return res.data;
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
  ansiFips, // ansi / fips code of county, e.g., 06073 (for San Diego, CA)
  fields = ["date_time", "value"], // fields to return, return all if empty
  windowSizeDays = 7, // size of window over which to aggregate cases; only
  isCumulative = false, // true if cumulative values needed
  getAverage = false, // true if average for windowsize is needed
}: // 1 and 7 are currently supported
CaseloadProps) => {
  // determine metric ID based on whether country or state data requested.
  // 74: state-level new COVID-19 cases in last 7 days
  // 77: country-level new COVID-19 cases in last 7 days

  const getMetricId: Function = ({
    isState,
    isCounty,
    windowSizeDays,
    isCumulative,
  }: GetMetricIdProps): number | undefined => {
    if (isState) {
      if (isCumulative) return 72;
      else if (windowSizeDays === 7) {
        return 74;
      } else if (windowSizeDays === 1) return 73;
    } else if (isCounty) {
      if (isCumulative) return 102;
      if (windowSizeDays === 7) {
        return 104;
      } else if (windowSizeDays === 1) return 103;
    } else {
      if (isCumulative) return 75;
      if (windowSizeDays === 7) {
        return 77;
      } else if (windowSizeDays === 1) return 76;
      else {
        throw Error("Unexpected state reached");
      }
    }
  };
  const isState = stateName !== undefined || stateId !== undefined;
  const isCounty = ansiFips !== undefined;
  const metric_id = getMetricId({
    isState,
    isCounty,
    windowSizeDays,
    isCumulative,
  });

  // define spatial resolution based on same
  const spatial_resolution = isState
    ? "state"
    : isCounty
    ? "county"
    : "country";

  // prepare parameters
  const params: ObservationQueryArgs = {
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
  if (ansiFips !== undefined) params.fips = ansiFips;
  // send request and return response data
  const res: MetricRecords = await ObservationQuery({ ...params });
  if (getAverage && windowSizeDays !== 1)
    res.forEach(d => {
      d.value = Math.round((d.value as number) / windowSizeDays);
    });
  return res;
};

/**
 * Execute set of queries in parallel and return results asynchronously.
 * @method
 * @param  {[type]} queries [description]
 * @return {[type]}         [description]
 */
export const execute = async function({
  queries,
}: {
  queries: Record<string, Promise<any>> | Record<string, Promise<any>[]>;
}) {
  const results: { [k: string]: any } = {};
  for (const [k, v] of Object.entries(queries)) {
    if (v === undefined || v === null) continue;
    if (typeof v !== "string" && v.length !== undefined) {
      if (results[k] === undefined) results[k] = [];
      for (let i = 0; i < v.length; i++) {
        const res = await v[i];
        results[k] = results[k].concat(res);

        // add min and max observations if any
        ["max_all_time", "min_all_time"].forEach(minMaxField => {
          if (res[minMaxField] !== undefined) {
            if (results[k][minMaxField] !== undefined) {
              throw Error(
                `Field '${minMaxField}}' was already defined on results for ` +
                  `metric with id = '${k}'. It can only be defined by one ` +
                  `API response.`
              );
            }
            results[k][minMaxField] = res[minMaxField];
          }
        });
      }
    } else {
      const res = await v;
      results[k] = res;
    }
  }
  return results;
};

/*
 * Get COVID-19 deaths time series for state in USA.
 * NOTE: Either an ID *or* a name for the country / state should be provided
 * but not both for response to behave as expected.
 */
export const Deaths = async ({
  countryId, // place_id for country, e.g., 239
  countryIso3, // name for country, e.g., United States of America
  stateId, // place_id for state, e.g., 264
  stateName, // name for state, e.g., Alabama
  fields = ["date_time", "value"], // fields to return, return all if empty
  windowSizeDays = 7, // size of window over which to aggregate cases; only
}: // 1 and 7 are currently supported
DeathsProps) => {
  // determine metric ID based on whether country or state data requested.
  // 74: state-level new COVID-19 cases in last 7 days
  // 77: country-level new COVID-19 cases in last 7 days

  const getMetricId = ({
    isState,
    windowSizeDays,
  }: GetMetricIdProps): number | undefined => {
    if (isState) {
      if (windowSizeDays === 7) {
        return 94;
      } else if (windowSizeDays === 1) return 93;
    } else {
      throw Error(
        "Not yet implemented: Country-level COVID deaths data. Only state-level deaths data are currently implemented."
      );
    }
  };
  const isState = stateName !== undefined || stateId !== undefined;
  const metric_id = getMetricId({ isState, windowSizeDays });

  if (metric_id === undefined) {
    throw Error("Could not find metric ID.");
  }

  // define spatial resolution based on same
  const spatial_resolution = isState ? "state" : "country";

  // prepare parameters
  const params: ObservationQueryArgs = {
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

export const Place = async ({
  one = false,
  ansiFips,
  level,
  iso3,
  fields,
}: PlaceQueryProps) => {
  // prepare params
  const params = new URLSearchParams();
  const toAdd: [string, any][] = [
    ["iso3", iso3],
    ["ansi_fips", ansiFips],
    ["level", level],
    ["fields", fields],
  ];
  addParams(toAdd, params);
  const req = await axios(`${API_URL}/get/place`, {
    params,
  });
  const res = await req;
  if (res.data !== undefined) {
    if (one) {
      if (res.data.data.length > 0) return res.data.data[0];
      else return null;
    }
    return res.data.data;
  } else return false;
};

function addParams(toAdd: [string, any][], params: URLSearchParams): void {
  toAdd.forEach(([key, value]) => {
    if (value !== undefined) {
      if (typeof value === "object" && value.length > 0) {
        value.forEach((v: any) => {
          params.append(key, v);
        });
      } else params.append(key, value);
    }
  });
}
